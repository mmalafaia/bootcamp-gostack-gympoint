import * as Yup from 'yup';
import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
  async store(req, res) {
    const schemaBody = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const schemaParams = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schemaParams.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const studentExists = await Student.findByPk(req.params.student_id);

    if (!studentExists) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    const { id } = await HelpOrder.create({
      student_id: req.params.student_id,
      question: req.body.question,
    });

    return res.json({
      id,
    });
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { student_id } = req.params;

    const student = await Student.findAll({ where: { id: student_id } });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    const helporder = await HelpOrder.findAll({ where: { student_id } });

    return res.json(helporder);
  }
}

export default new HelpOrderController();
