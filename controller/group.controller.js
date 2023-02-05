const { findByIdAndUpdate } = require("../schema/coursesSchema");
const coursesSchema = require("../schema/coursesSchema");
const groupSchema = require("../schema/groupSchema");
const repetitorSchema = require("../schema/repetitorSchema");

exports.getGroupStudents = (req, res) => {
  const { _id, role } = req.user;
  const { groupID } = req.params;
  groupSchema
    .findById(groupID)
    .populate("students")
    .exec((err, groupDoc) => {
      if (!err) {
        res.json({
          success: true,
          students: groupDoc.students.map((stud) => {
            return {
              _id: stud._id,
              firstName: stud.firstName,
              lastName: stud.lastName,
              phone: stud.phone,
              mail: stud.mail,
              image: stud.image,
            };
          }),
        });
      } else {
        res.json({
          success: false,
          msg: "შეცდომა, სცადეთ მოგვიანებით",
        });
      }
    });
};

exports.addGroup = (req, res) => {
  const { courseID } = req.params;
  const { min, max, startAt, dates, title } = req.body;

  const splited = dates.map((elem) => {
    const splidetStartAt = elem.value.split(":");
    return {
      key: elem.key,
      value: splidetStartAt.slice(0, splidetStartAt.length - 1).join(":"),
    };
  });
  const newGroup = new groupSchema({
    courseID,
    min,
    max,
    startAt: startAt.split("T")[0],
    dates: splited,
    title,
  });
  newGroup.save((err, doc) => {
    if (!err) {
      coursesSchema.findOneAndUpdate(
        { _id: courseID },
        {
          $push: {
            groups: doc._id,
          },
        },
        { upsert: true, new: true },
        (err, tutorDoc) => {
          if (err) {
            console.log(err);
            res.json({ success: false, msg: "გთხოვთ სცადოთ მოგვიანებით" });
          } else {
            res.json({
              success: true,
              msg: "ჯგუფი წარმატებით დაემატა",
            });
          }
        }
      );
    } else {
      console.log(err);
      res.json({
        success: false,
        msg: "კურსის დამატება ვერ მოხერხდა გთხოვთ სცადოთ მოგვიანებით",
      });
    }
  });
};

exports.deleteGroup = (req, res) => {
  const { _id, role } = req.user;
  const { groupID, courseID } = req.params;
  groupSchema.findByIdAndDelete(
    { _id: groupID, courseID: courseID },
    (err, doc) => {
      if (!err) {
        if (doc) {
          coursesSchema.findById(courseID).then((result) => {
            result.groups = result.groups.filter(
              (group) => group.toString() !== groupID
            );
            result.save((err, ddd) => {
              if (!err) {
                res.json({ success: true, msg: "წაიშალა წამრატებით" });
              } else {
                res.json({ success: false, msg: "შეცდომა" });
                console.log(err);
              }
            });
          });
        } else {
          res.json({ success: false, msg: "ჯგუფის ID არ ემთხვევა" });
        }
      } else {
        console.log(err);
      }
    }
  );
};
exports.updateMeetingLink = (req, res) => {
  const { groupID } = req.params;
  const { meetingLink } = req.body;
  const updatedMeetingLink = {
    meetingLink: meetingLink,
  };
  groupSchema.findByIdAndUpdate(groupID, updatedMeetingLink, (err, doc) => {
    if (!err) {
      res.json({ success: true, msg: "ლინკი წარმატებით შეიცვალა" });
    } else {
      res.json({
        success: false,
        msg: " ლინკის შეცვლა ვერ მოხერხდა სცადეთ მოგვიანებით",
      });
    }
  });
};
