import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import Student from '../models/Student';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, password } = req.body;
    let id = 0;
    let name = '';

    if (password) {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (!(await user.checkPassword(password))) {
        return res.status(401).json({ error: 'Password does not match' });
      }

      id = user.id;
      name = user.name;
    } else {
      const student = await Student.findOne({ where: { email } });

      if (!student) {
        return res.status(401).json({ error: 'Student not found' });
      }

      id = student.id;
      name = student.name;
    }

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
