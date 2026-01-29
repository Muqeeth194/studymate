import LearningPath from "@/models/LearningPath";

export async function updateCourseProgress(courseId: string) {
  const course = await LearningPath.findById(courseId);
  if (!course) return;

  let totalTopics = 0;
  let completedTopics = 0;
  let completedTopicIds: string[] = [];
  let calculatedCurrentWeek = 1;
  let firstIncompleteFound = false;
  let totalMinutesStudied = 0;

  // 1. Traverse the Syllabus
  course.roadmap.syllabus.forEach((week: any) => {
    // Check if we should update the current week
    // If we haven't found an incomplete topic yet, this might be the current week
    let weekHasIncompleteTopic = false;

    week.topics.forEach((topic: any) => {
      totalTopics++;

      if (topic.isCompleted) {
        completedTopics++;
        completedTopicIds.push(topic.id);

        // We assume "study time" is the estimated time of completed topics
        // This is easier than tracking real-time active usage
        totalMinutesStudied += topic.estimatedMinutes || 15;
      } else {
        weekHasIncompleteTopic = true;
      }
    });

    // The current week is the first week that has at least one incomplete topic
    // OR if all are complete, it stays at the last week
    if (weekHasIncompleteTopic && !firstIncompleteFound) {
      calculatedCurrentWeek = week.weekNumber;
      firstIncompleteFound = true;
    }
  });

  // If everything is complete, set current week to the last week
  if (!firstIncompleteFound && course.roadmap.syllabus.length > 0) {
    calculatedCurrentWeek = course.roadmap.syllabus.length;
  }

  // 2. Calculate Percentage
  const percentComplete =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // 3. Update Course Status
  // If 100% complete, mark course as 'completed'
  if (percentComplete === 100) {
    course.status = "completed";
  } else if (percentComplete > 0 && course.status === "generating") {
    course.status = "active";
  }

  // 4. Update the Progress Object
  course.progress = {
    percentComplete,
    currentWeek: calculatedCurrentWeek,
    completedTopicIds,
    totalStudyMinutes: totalMinutesStudied,
    lastStudySession: new Date(), // Update timestamp
  };

  await course.save();
  return course.progress;
}
