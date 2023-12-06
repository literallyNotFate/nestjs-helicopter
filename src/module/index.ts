import { AttributeHelicopterModule } from './attribute-helicopter/attribute-helicopter.module';
import { AttributesModule } from './attributes/attributes.module';
import { EngineModule } from './engine/engine.module';
import { HelicopterModule } from './helicopter/helicopter.module';

export const Modules = [
  HelicopterModule,
  AttributeHelicopterModule,
  AttributesModule,
  EngineModule,
];
