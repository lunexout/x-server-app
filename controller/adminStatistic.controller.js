const mainSchema = require("../schema/mainSchema");
const pointSchema = require("../schema/pointSchema");
const studentSchema = require("../schema/studentSchema");
const { getAvarage } = require("../utils/pointAvarage");

exports.statistic = async (req, res) => {
  try {
    const { subject_id, class_id, point, attendance, semester } = req.body;

    const students = await studentSchema
      .find({ class_id })
      .populate({
        path: "points",
        populate: {
          path: "subject_id",
          select: "subject_name  _id",
        },
      })
      .populate({
        path: "points",
        populate: {
          path: "teacher_id",
          select: "name surname -_id",
        },
      })
      .exec();
    if (!students)
      return res.json({ success: false, msg: "მოსწავლეები არ მოიძებნა" });
    let responseData = [];

    students.map((student) => {
      const { name, surname, image, _id } = student;
      const avg1 = getAvarage(student, subject_id, true);
      const avg2 = getAvarage(student, subject_id, false);
      const avarage =
        semester === 0
          ? avg1
          : semester === 1
          ? avg2
          : { avg: (avg1.avg + avg2.avg) / 2 };
      if (
        point[0] <= Math.round(avarage.avg) &&
        point[1] >= Math.round(avarage.avg) &&
        attendance[0] <= Math.round(avg1.attendance) &&
        attendance[1] >= Math.round(avg1.attendance)
      ) {
        console.log(1);
        responseData.push({
          _id,
          name,
          surname,
          image,
          avg: Math.round(avarage.avg),
          attendance: Math.round(avg1.attendance),
        });
      }
    });
    const mainClass = await mainSchema
      .findById(class_id)
      .populate({
        path: "subjects.teacher_id",
      })
      .exec();

    const teacherInfo = mainClass.subjects.filter(
      (mainSubject) => mainSubject.subject_id.toString() === subject_id
    );
    const teacher = teacherInfo[0].teacher_id;
    const teacherName = teacher
      ? `${teacher.name} ${teacher.surname}`
      : "მასწავლებელი არაა დამატებული!";

    //
    return res.json({
      success: true,
      statistic: responseData,
      teacher: teacherName,
    });
  } catch (err) {
    throw err;
  }
};
