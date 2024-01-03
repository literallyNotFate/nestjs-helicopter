import { AttributeHelicopterResponseDto } from './../../module/attribute-helicopter/dto/attribute-helicopter-response.dto';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../module/user/entities/user.entity';
import { HelicopterService } from '../../module/helicopter/helicopter.service';
import { EngineService } from '../../module/engine/engine.service';
import { AttributesService } from '../../module/attributes/attributes.service';
import { AttributeHelicopterService } from '../../module/attribute-helicopter/attribute-helicopter.service';
import { HelicopterDto } from '../../module/helicopter/dto/helicopter.dto';
import { of, switchMap } from 'rxjs';
import { EngineDto } from '../../module/engine/dto/engine.dto';
import { AttributesDto } from '../../module/attributes/dto/attributes.dto';

@Injectable()
export class CreatorGuard implements CanActivate {
  constructor(
    private readonly helicopterService: HelicopterService,
    private readonly engineService: EngineService,
    private readonly attributeService: AttributesService,
    private readonly attributeHelicopterService: AttributeHelicopterService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const creator: User = request.user as User;
    const id: number = +request.params.id;
    const type: string = request.url.match(/\/(\w+)\/\d+/)[1];

    switch (type) {
      case 'helicopter':
        return this.helicopterService
          .findOne(id)
          .pipe(
            switchMap((helicopter: HelicopterDto) => {
              return helicopter
                ? of(helicopter.creator.id === creator.id)
                : of(false);
            }),
          )
          .toPromise();
      case 'engine':
        return this.engineService
          .findOne(id)
          .pipe(
            switchMap((engine: EngineDto) => {
              return engine ? of(engine.creator.id === creator.id) : of(false);
            }),
          )
          .toPromise();
      case 'attribute':
        return this.attributeService
          .findOne(id)
          .pipe(
            switchMap((attribute: AttributesDto) => {
              return attribute
                ? of(attribute.creator.id === creator.id)
                : of(false);
            }),
          )
          .toPromise();
      case 'attribute-helicopter':
        return this.attributeHelicopterService
          .findOne(id)
          .pipe(
            switchMap((ah: AttributeHelicopterResponseDto) => {
              return ah ? of(ah.creator.id === creator.id) : of(false);
            }),
          )
          .toPromise();
      default:
        return false;
    }
  }
}
