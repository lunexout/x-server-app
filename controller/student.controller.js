const coursesSchema = require("../schema/coursesSchema");
const groupSchema = require("../schema/groupSchema");
const studentSchema = require("../schema/studentSchema");

exports.add = (req, res) => {
  // missing! add student in course group

  const { courseID, groupID } = req.body;
  console.log(courseID, groupID);
  studentSchema.findById(
    { _id: req.user._id },
    {
      courses: {
        $elemMatch: {
          courseID: courseID,
        },
      },
    },
    (err, result) => {
      if (err) {
        res.json({
          success: false,
          msg: "შეცდომა, გთხოვთ სცადოთ მოგვიანებით!",
        });
      }
      if (result.courses.length > 0) {
        console.log(result);
        res.json({
          success: false,
          msg: "თქვენ უკვე გაწევრიანებული ხართ მითითებულ კურსში!",
        });
      } else {
        studentSchema.findByIdAndUpdate(
          { _id: req.user._id },
          {
            $push: {
              courses: { courseID, groupID },
            },
          },
          (err, doc) => {
            if (!err) {
              groupSchema.findByIdAndUpdate(
                groupID,
                {
                  $push: {
                    students: req.user._id,
                  },
                },
                (err, doc) => {
                  if (!err) {
                    res.json({
                      success: true,
                      msg: "წარმატებით დაემათეთ მითითებულ კურსში",
                    });
                  } else {
                    res.json({
                      success: false,
                      msg: "შეცდომა გთხოვთ სცადოთ მოგვიანებით!",
                    });
                  }
                }
              );
            } else {
              res.json({
                success: false,
                msg: "შეცდომა, გთხოვთ სცადოთ მოგვიანებით!",
              });
            }
          }
        );
      }
    }
  );
};

exports.getGroups = (req, res) => {
  const { type, skip, limit } = req.params;
  studentSchema
    .findById(req.user._id)
    .populate("courses.courseID")
    .exec((err, doc) => {
      if (!err) {
        const onlyCourse = doc.courses.map((elm) => {
          const {
            _id,
            repetitorID,
            title,
            rating,
            numberOfRating,
            description,
            category,
            type,
            method,
            hrPrice,
            price,
            payMethod,
            isGroup,
            resources,
            isPublished,
            groups,
            image,
          } = elm.courseID;
          return {
            _id,
            repetitorID,
            title,
            rating,
            numberOfRating,
            description,
            category,
            type,
            method,
            hrPrice,
            price,
            payMethod,
            isGroup,
            resources,
            isPublished,
            groups,
            image,
            groupID: elm.groupID,
          };
        });
        const filteredCourses =
          type === "all"
            ? onlyCourse
            : onlyCourse.filter((course) => course.type === type);
        const Skip = parseInt(skip);
        const Limit = parseInt(limit) + Skip;
        res.json({
          success: true,
          total: filteredCourses.length,
          all: onlyCourse
            .map((el) => {
              return {
                _id: el._id,
                title: el.title,
              };
            })
            .reverse(),
          courses: filteredCourses.reverse().slice(Skip, Limit),
        });
      } else {
        res.json({ success: false });
      }
    });
};

exports.getSingleGroup = (req, res) => {
  studentSchema
    .findById(req.user._id)
    .populate({
      path: "courses",
      populate: {
        path: "courseID",
      },
    })
    .exec((err, doc) => {
      if (!err) {
        res.json({ success: true, course: doc.groups });
      }
    });
};

exports.AddWishList = (req, res) => {
  studentSchema.findById(req.user._id).exec((err, doc) => {
    if (err) {
      res.json({ success: false, msg: "შეცდომა, გთხოვთ სცადოთ მოგვიანებით!" });
    }
    if (doc) {
      const exist = doc.wishList.some(
        (wish) => wish.toString() === req.body.courseID
      );
      if (exist) {
        res.json({
          success: false,
          msg: "კურსი უკვე დამატებულია სურვილების სიაში!",
        });
      } else {
        doc.wishList.push(req.body.courseID);
        doc.save((err, doc) => {
          if (!err) {
            res.json({ success: true, msg: "კურსი დაემატა სურვილების სიაში" });
          } else {
            res.json({
              success: false,
              msg: "შეცდომა, გთხოვთ სცადოთ მოგვიანებით!",
            });
          }
        });
      }
    } else {
      res.json({ success: false, msg: "შეცდომა" });
    }
  });
};

exports.getWishList = (req, res) => {
  studentSchema
    .findById(req.user._id)
    .populate("wishList", "-resources")
    .exec(async (err, doc) => {
      if (!err) {
        res.json({ success: true, wishList: doc.wishList });
      } else {
        res.json({ success: false, msg: "შეცდომა, გთხოვთ სცადოთ მოგვიანებით" });
      }
    });
};
exports.getSingleCourse = (req, res) => {
  const { courseID } = req.params;
  coursesSchema
    .findById(courseID)
    .populate("groups")
    .exec((err, doc) => {
      if (!err) {
        doc.groups = doc.groups.reverse();
        res.json({
          success: true,
          course: doc,
        });
      } else {
        console.log(err);
        res.json({ success: false, msg: "კურსი არ არსებობს" });
      }
    });
};
exports.deleteWishList = (req, res) => {
  const { courseID } = req.body;
  console.log(req.body);
  studentSchema.findById(req.user._id).then((result) => {
    result.wishList = result.wishList.filter(
      (wish) => wish.toString() !== courseID
    );
    result.save((err, doc) => {
      if (!err) {
        res.json({ success: true, msg: "კურსი წაიშალა სურვილების სიიდან" });
      } else {
        res.json({ success: false, msg: "შეცდომა, გთხოვთ სცადოთ მოგვიანებით" });
      }
    });
  });
};

exports.addCourseRating = (req, res) => {
  const roundNumber = (number) => {
    var multiplier = 1 / 0.5;
    return Math.round(number * multiplier) / multiplier;
  };
  const { courseID, rate } = req.body;
  coursesSchema.findById(courseID).then((result) => {
    if (result.rating.toString() === "0") {
      result.rating = rate;
      result.numberOfRating = result.numberOfRating + 1;
      result.ratingSum = rate;
    } else {
      const oldRating = parseFloat(result.ratingSum.toString());
      result.rating = roundNumber(
        (oldRating + rate) / (result.numberOfRating + 1)
      );
      result.ratingSum = oldRating + rate;
      result.numberOfRating = result.numberOfRating + 1;
    }
    result.save((err, doc) => {
      if (!err) {
        res.json({ success: true, msg: "თქვენი ზარი მიღებულია" });
      } else {
        res.json({
          success: false,
          msg: "შეცდომა, გთხოვთ სცადოთ მოგვიანებით!",
        });
      }
    });
  });
};
exports.addCommentToCourse = (req, res) => {
  const { courseID, comment } = req.body;
  coursesSchema.findById(courseID).then((result) => {
    const commentData = {
      authorID: req.user._id,
      comment: comment,
    };
    if (result) {
      result.comments.push(commentData);
      result.save((err, doc) => {
        if (!err) {
          res.json({ success: true, msg: "კომენტარი წარმატებით დაიწერა" });
        } else {
          res.json({
            succes: false,
            msg: "შეცდომა, გთხოვთ სცადოთ მოგვიანებით",
          });
        }
      });
    } else {
      res.json({ success: false, msg: "შეცდომა, გთხოვთ სცადოთ მოგვიანებით!" });
    }
  });
};
// exports.addCourseComment = (req, res) => {
//   const { courseID, comment } = req.body;
//   coursesSchema.findById(courseID).then((result) => {
//     const commentData = {
//       authorID: req.user._id,
//       comment: comment,
//     };
//     if (result) {
//       result.comments.push(commentData);
//       result.save((err, doc) => {
//         if (!err) {
//           res.json({ success: true, msg: "კომენტარი წარმატებით დაიწერა" });
//         } else {
//           res.json({
//             succes: false,
//             msg: "შეცდომა, გთხოვთ სცადოთ მოგვიანებით",
//           });
//         }
//       });
//     } else {
//       res.json({ success: false, msg: "შეცდომა, გთხოვთ სცადოთ მოგვიანებით!" });
//     }
//   });
// };
