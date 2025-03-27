// storage/dataFilterService.js
// This enhanced version creates fallback users for any missing userIds
export class DataFilterService {
  filterRelevantData(posts, comments, users) {
    // Extract unique user IDs from posts
    const uniqueUserIds = [...new Set(posts.map((post) => post.userId))];

    // Extract post IDs for filtering comments
    const postIds = posts.map((post) => post.id);

    // Filter comments that belong to our posts
    const matchingComments = comments.filter((comment) =>
      postIds.includes(comment.postId)
    );

    // Get unique user IDs from comments
    const commentUserIds = [
      ...new Set(
        matchingComments.map((comment) => {
          // Handle both formats: comment.userId or comment.user.id
          return comment.userId || (comment.user && comment.user.id);
        })
      ),
    ];

    // Combine all relevant user IDs from posts and comments
    const allRelevantUserIds = [
      ...new Set([...uniqueUserIds, ...commentUserIds]),
    ];

    // Filter users that are either post authors or comment authors
    let matchingUsers = users.filter((user) =>
      allRelevantUserIds.includes(user.id)
    );

    // CREATE FALLBACK USERS for missing user IDs
    // This ensures we always have a username for every post
    const existingUserIds = matchingUsers.map((user) => user.id);
    const missingUserIds = allRelevantUserIds.filter(
      (id) => !existingUserIds.includes(id)
    );

    if (missingUserIds.length > 0) {
      console.log("Creating fallback users for IDs:", missingUserIds);

      // Create fallback users for any missing userIds
      const fallbackUsers = missingUserIds.map((id) => ({
        id: id,
        username: `User #${id}`, // Fallback username format
      }));

      // Add fallback users to our users list
      matchingUsers = [...matchingUsers, ...fallbackUsers];
    }

    // Clean up comment structure if needed
    matchingComments.forEach((comment) => {
      if (comment.user) {
        // If comment has user object but no userId, extract it
        if (!comment.userId && comment.user.id) {
          comment.userId = comment.user.id;
        }
      }
    });

    return {
      posts,
      users: matchingUsers,
      comments: matchingComments,
    };
  }
}

export const dataFilterService = new DataFilterService();
