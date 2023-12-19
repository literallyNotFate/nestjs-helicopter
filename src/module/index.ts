import { AuthModule } from '../core/auth/auth.module';
import { AttributeHelicopterModule } from './attribute-helicopter/attribute-helicopter.module';
import { AttributesModule } from './attributes/attributes.module';
import { EngineModule } from './engine/engine.module';
import { HelicopterModule } from './helicopter/helicopter.module';
import { UserModule } from './user/user.module';

export const Modules = [
  AuthModule,
  HelicopterModule,
  UserModule,
  EngineModule,
  AttributesModule,
  AttributeHelicopterModule,
];
