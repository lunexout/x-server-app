const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const env = require('./../env.json')
const mongoose = require('mongoose')
const globalService = require('../service/global.service')
const acitonSchema = require('../schema/logActions')
const adminSchema = require('../schema/adminSchema')
const teacherSchema = require('../schema/teacherSchema')
const studentSchema = require('../schema/studentSchema')
const mainSchema = require('../schema/mainSchema')
const pointSchema = require('../schema/pointSchema')
const subjectSchema = require('../schema/subjectSchema')
const userRole = require('../config/userRole.json')
const { classSorter } = require('../utils/classSorter')

const connectDatabase = require('../utils/connect-database')

exports.changePassword = async (req, res) => {
  try {
    const userMongoId = req.user._id
    const { password, currentPassword } = req.body

    const user = await adminSchema.findById(userMongoId).exec()
    if (!user) return res.json({ success: false })

    if (!bcrypt.compareSync(currentPassword, user.password))
      return res.json({ success: false, msg: 'მიმდინარე პაროლი არასწორია!' })

    const hashPassword = await globalService.hashGenerator(password)

    const passwordUpdate = await adminSchema.findByIdAndUpdate(userMongoId, {
      password: hashPassword,
    })
    res.json({ success: true, msg: 'პაროლი წარმატებით შეიცვალა' })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა, გთხოვთ სცადოთ მოგვიანებით!' })
  }
}
exports.resetTeacherPassword = async (req, res) => {
  try {
    const { _id, ID } = req.body
    const hashPassword = await globalService.hashGenerator(ID)
    const teacher = await teacherSchema.findByIdAndUpdate(_id, {
      password: hashPassword,
    })
    res.json({ success: true, msg: 'მასწავლებლის პაროლი განახლდა' })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა, გთხოვთ სცადოთ მოგვიანებით!' })
  }
}
exports.resetStudentPassword = async (req, res) => {
  try {
    const { _id, ID } = req.body
    const hashPassword = await globalService.hashGenerator(ID)
    const teacher = await studentSchema.findByIdAndUpdate(_id, {
      password: hashPassword,
    })
    res.json({ success: true, msg: 'მოსწავლის პაროლი განახლდა' })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა, გთხოვთ სცადოთ მოგვიანებით!' })
  }
}
exports.selectClasses = async (req, res) => {
  try {
    const classes = await mainSchema.find().select('ID _id').exec()
    res.json({ success: true, classes: classSorter(classes) })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა, გთხოვთ სცადოთ მოგვიანებით!' })
  }
}
exports.addClass = async (req, res) => {
  try {
    const { className } = req.body
    const mainClass = await mainSchema.findOne({ ID: className }).exec()
    if (mainClass)
      return res.json({
        success: false,
        msg: 'მითითებული კლასი უკვე რეგისტრირებულია!',
      })

    const newClass = new mainSchema({ ID: className })
    const saveNewClass = await newClass.save()
    res.json({ success: true, msg: 'კლასი წარმატებით დაემატა!' })
  } catch (err) {
    console.log(err)
    res.json({
      success: false,
      msg: 'შეცდომა, გთხოვთ სცადოთ მოგვიანებით!',
    })
  }
}
exports.addSubjectsToClass = async (req, res) => {
  try {
    const { classId, subjects } = req.body
    const mainClass = await mainSchema.findById(classId).exec()
    if (!mainClass)
      return res.json({ success: false, msg: 'მითითებული კლასი არ არსებობს' })

    subjects.map((Rsubject) => {
      const checkSubjectExist = mainClass.subjects.some(
        (Msubject) => Msubject.subject_id.toString() === Rsubject.subject_id,
      )
      if (!checkSubjectExist) {
        mainClass.subjects.push({ subject_id: Rsubject.subject_id })
      }
    })

    const saveClass = await mainClass.save()
    res.json({
      success: true,
      msg: 'საგნები წარმატებით დაემატა მითითებულ კლასში',
    })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა , გთხოვთ სცადოთ მოგვიანებით!' })
  }
}

exports.deleteSubjectsToClass = async (req, res) => {
  try {
    const { classId, subjectId } = req.body
    let subjectForDelete
    const ifPointAlreadyExist = await pointSchema.find({
      subject_id: subjectId,
      class_id: classId,
    })
    console.log(ifPointAlreadyExist)
    if (ifPointAlreadyExist.length > 0)
      return res.json({ success: false, msg: 'ამ საგინს მოშლა ვერ მოხერხდა' })
    const mainClass = await mainSchema.findById(classId)
    const checkSubjectExist = mainClass.subjects.some(
      (subject) => subject.subject_id.toString() === subjectId,
    )
    if (!checkSubjectExist)
      return res.json({
        success: false,
        msg: 'ამ კლასში არ არსებობს მითითებული საგანი!',
      })
    mainClass.subjects.map((subject) => {
      if (subject.subject_id.toString() === subjectId) {
        subjectForDelete = subject
        subject.remove()
        mainClass.save()
      }
    })
    if (subjectForDelete.teacher_id) {
      const teacher = await teacherSchema.findById(subjectForDelete.teacher_id)
      teacher.classes.map((TClass) => {
        if (TClass.class_id.toString() === classId) {
          TClass.subjects.map((subject) => {
            if (subject.subject_id.toString() === subjectId) {
              subject.remove()
              teacher.save()
            }
          })
        }
      })
    }
    return res.json({ success: true, msg: 'მოთხოვნა წარმატებით შესრულდა!' })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა , გთხოვთ სცადოთ მოგვიანებით!' })
  }
}
exports.selectSubjects = async (req, res) => {
  try {
    const subjects = await subjectSchema
      .find()
      .select('-ifChoosedSubject')
      .exec()
    res.json({ success: true, subjects })
  } catch (error) {
    console.log(error)
    res.json({ success: false, msg: 'შეცდომა , გთხოვთ სცადოთ მოგვიანებით!' })
  }
}

exports.addSubject = async (req, res) => {
  try {
    const { subjectName, ifChoosedSubject } = req.body

    const subject = await subjectSchema
      .findOne({ subject_name: subjectName })
      .exec()

    if (subject)
      return res.json({
        success: false,
        msg: 'საგანი მითითებული დასახელებით არსებობს!',
      })

    const newSubject = new subjectSchema({
      subject_name: subjectName,
      ifChoosedSubject,
    })

    let saveSubject = await newSubject.save()

    res.json({ success: true, msg: 'საგანი წარმატებით დაემატა' })
  } catch (err) {
    console.log(err)

    res.json({ success: false, msg: 'შეცდომა , გთხოვთ სცადოთ მოგვიანებით!' })
  }
}

exports.addOneSubjectToClass = async (req, res) => {
  try {
    const { subjectId, classId } = req.body
    const mainClass = await mainSchema.findById(classId).exec()
    if (!mainClass)
      return res.json({
        success: false,
        msg: 'კლასი არ მოიძებნა!',
      })
    const ifSubjectExist = mainClass.subjects.some(
      (subject) => subject.subject_id.toString() === subjectId,
    )
    if (!ifSubjectExist) {
      mainClass.subjects.push({ subject_id: subjectId })
      const saveClass = await mainClass.save()
      res.json({ success: true, msg: 'მოთხოვნა წარმატებით შესრულდა' })
    } else {
      res.json({
        success: false,
        msg: 'მოცემული საგანი უკვე მიმაგრებულია კლასზე!',
      })
    }
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა , გთხოვთ სცადოთ მოგვიანებით!' })
  }
}

exports.concretClassSubjects = async (req, res) => {
  try {
    const { class_id } = req.body
    const mainClass = await mainSchema
      .findById(class_id)
      .populate({ path: 'subjects.subject_id' })
      .select('subjects')
      .exec()

    if (!mainClass)
      return res.json({ success: false, msg: 'მითითებული კლასი არ არსებობს' })

    const subjects = result.subjects.map((subject) => subject.subject_id)
    res.json({ success: true, subjects })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა , გთხოვთ სცადოთ მოგვიანებით!' })
  }
}
exports.addStudent = async (req, res) => {
  try {
    const user = req.body
    const hashPassword = await globalService.hashGenerator(user.ID)
    const newStudent = {
      ...user,
      password: hashPassword,
      role: userRole.STUDENT,
    }

    const student = await studentSchema.findOne({ ID: user.ID }).exec()
    if (student)
      return res.json({
        success: false,
        msg: 'მოსწავლე ამ პირადი ნომრით უკვე რეგისტრირებულია!',
      })

    const createStudent = new studentSchema(newStudent)

    const saveNewStudent = await createStudent.save()

    const addStudentToClass = await mainSchema.findByIdAndUpdate(
      user.class_id,
      {
        $push: {
          students: { student_id: saveNewStudent._id },
        },
      },
    )

    res.json({
      success: true,
      msg: 'მოსწავლე წარმატებით დარეგისტრირდა',
    })
  } catch (err) {
    console.log(err)
    res.json({
      success: false,
      msg: 'მოსწავლის დარეგისტრირება ვერ მოხერხდა, გთხოვთ სცადოთ მოგვიანებით!',
    })
  }
}
exports.deleteStudent = async (req, res) => {
  try {
    const { studentId, classId } = req.body

    const mainClass = await mainSchema.findOneAndUpdate(
      { _id: classId },
      {
        $pull: { students: { student_id: studentId } },
      },
    )
    if (!mainClass)
      return res.json({ success: false, msg: 'მითითებული კლასი არ არსებობს!' })
    const studentForDelete = await studentSchema.findByIdAndDelete(studentId)
    return res.json({ success: true, msg: 'მოსწავლე წაიშალა წარმატებით!' })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა , გთხოვთ სცადოთ მოგვიანებით!' })
  }
}

exports.loginAsTeacher = async (req, res) => {
  try {
    const { _id } = req.body
    const teacher = await teacherSchema.findById(_id).exec()

    if (!teacher)
      return res.json({ success: false, msg: 'მასწავლებელი ვერ მოიძებნა!' })

    const { ID, role } = teacher

    const access_token = jwt.sign(
      {
        ID,
        role,
        _id,
        // logger: doc._id,
      },
      env.ACCESS_TOKEN,
      {
        expiresIn: '12h',
      },
    )

    res.json({ success: true, access_token })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა , გთხოვთ სცადოთ მოგვიანებით!' })
  }
}

exports.addTeacher = async (req, res) => {
  try {
    const user = req.body
    const teacher = await teacherSchema.findOne({ ID: user.ID }).exec()

    if (teacher)
      return res.json({
        success: false,
        msg: 'მასწავლებელი ამ პირადი ნომრით უკვე რეგისტრირებულია!',
      })

    const hashPassword = await globalService.hashGenerator(user.ID)

    const newTeacher = {
      ...user,
      password: hashPassword,
      role: userRole.TEACHER,
    }

    const createTeacher = new teacherSchema(newTeacher)

    const saveNewTeacher = await createTeacher.save()
    res.json({
      success: true,
      msg: 'მასწავლებელი წარმატებით დარეგისტრირდა',
    })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა , გთხოვთ სცადოთ მოგვიანებით!' })
  }
}
exports.editClass = async (req, res) => {
  try {
    const { classId } = req.params

    const mainClass = await mainSchema
      .findById(classId)
      .populate({ path: 'damrigebeli', select: 'name surname _id ID' })
      .populate({ path: 'subjects.subject_id' })
      .populate({ path: 'subjects.teacher_id', select: 'name surname ID _id' })
      .exec()

    if (!mainClass)
      return res.json({ success: false, msg: 'არასწორი მონაცემები!' })

    const teachers = await teacherSchema
      .find()
      .select('name surname _id ID')
      .exec()

    if (!teachers)
      return res.json({ success: false, msg: 'არასწორი მონაცემები!' })

    res.json({
      success: true,
      damrigebeli: mainClass.damrigebeli,
      subjects: mainClass.subjects,
      teachers,
    })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა , გთხოვთ სცადოთ მოგვიანებით!' })
  }
}
exports.choosedSubjectsList = async (req, res) => {
  try {
    const subjects = await subjectSchema.find({ ifChoosedSubject: true }).exec()

    if (!subjects) return res.json({ success: false, subjects: [] })

    subjects.forEach((object) => {
      delete object['ifChoosedSubject']
    })
    res.json({ success: true, subjects })
  } catch (err) {
    console.log(err)
    res.json({ success: false, msg: 'შეცდომა , გთხოვთ სცადოთ მოგვიანებით!' })
  }
}

exports.newYear = async (req, res) => {
  try {
    const mainBase = await mainSchema.find().exec()
    const clearTeacherClasses = await teacherSchema.find()
    clearTeacherClasses.map((CTeacher) => {
      CTeacher.classes = []
      CTeacher.save()
    })
    mainBase.map(async (mainClass, idx) => {
      let classStep = parseInt(mainClass.ID.slice(0, -1))
      const classGroup = mainClass.ID.slice(-1)
      if (classStep !== 12) {
        classStep = classStep + 1 + classGroup
        mainClass.ID = classStep
        mainClass.subjects = []
        mainClass.save()
      } else {
        const removeDoc = await mainSchema.findByIdAndDelete(mainClass._id)
        const teachers = await teacherSchema.find().exec()
        // teachers.map((teacher, i) => {
        //   teacher.classes.map((TClass) => {
        //     if (TClass.class_id.toString() === mainClass._id.toString()) {
        //       TClass.remove();
        //       teacher.save();
        //     }
        //   });
        // });
        const students = await studentSchema.deleteMany({
          class_id: mainClass._id,
        })
      }
    })
    res.json({ success: true })
  } catch (err) {
    console.log(err)
    res.json({ success: false })
  }
}
