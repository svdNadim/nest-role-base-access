import { JwtService } from '@nestjs/jwt';

const generateToken = (jwtService: JwtService, payload, secret, expiresIn) => {
  const token = jwtService.sign(payload, {
    secret,
    expiresIn,
  });

  return token;
};
export default generateToken;
