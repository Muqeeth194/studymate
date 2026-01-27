import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import connectDB from "@/db/connectDB"; // Ensure this path matches your project structure
import User from "@/models/User"; // Ensure this path matches your project structure

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error Occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // 1. Connect to Database
  await connectDB();

  const eventType = evt.type;

  // 2. Handle the "user.created" event
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // console.log("email address from webhook:", email_addresses);

    // Clerk sends multiple emails, we take the primary one or the first one
    const primaryEmail = email_addresses[0]?.email_address;
    const fullName = `${first_name || ""} ${last_name || ""}`.trim();

    try {
      // Create the user in MongoDB
      // We use 'await' to ensure it finishes before the function exits
      await User.create({
        clerkId: id,
        email: primaryEmail,
        name: fullName,
        // avatar: image_url, <--- REMOVED
        // Defaults handle the rest
      });

      console.log(`User created in DB: ${primaryEmail}`);
    } catch (error) {
      console.error("Error creating user in DB:", error);
      // We still return 200 so Clerk doesn't retry infinitely if it's a duplicate key error
      return new Response("Error processing user", { status: 200 });
    }
  }

  // 3. Handle "user.updated" (Optional but recommended)
  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses[0]?.email_address;
    const fullName = `${first_name || ""} ${last_name || ""}`.trim();

    await User.findOneAndUpdate(
      { email: primaryEmail }, // Finding by email (or better, by clerkId if you added it)
      {
        name: fullName,
        avatar: image_url,
      },
    );
  }

  // 4. Handle "user.deleted" (Optional)
  if (eventType === "user.deleted") {
    const { id } = evt.data;
    // Note: You might need to query by clerkId here if email isn't available in delete payload
    await User.findOneAndDelete({ clerkId: id });
  }

  // 5. Success Return (Crucial)
  return new Response("Webhook received", { status: 200 });
}
