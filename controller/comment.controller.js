const coursesSchema = require("../schema/coursesSchema");

exports.getComments = (req, res) => {
  const { courseID, pageParam } = req.params;

  coursesSchema
    .findById(courseID)
    .populate("comments.authorID", "firstName lastName image")
    .exec((err, doc) => {
      if (!err) {
        const Limit = parseInt(pageParam) * 2;
        const commentsLength = doc.comments.length;
        // const Skip = parseInt(skip);
        // const Limit = parseInt(limit) + Skip;
        doc.comments = doc.comments.reverse().slice(Limit - 2, Limit);

        res.json({
          page: parseInt(pageParam),
          nextPage: parseInt(pageParam) + 1,
          total: commentsLength / 2,
          course: doc,
        });
      }
    });
};
