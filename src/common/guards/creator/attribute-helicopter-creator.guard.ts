import { AttributeHelicopterResponseDto } from '../../../module/attribute-helicopter/dto/attribute-helicopter-response.dto';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../../module/user/entities/user.entity';
import { catchError, of, switchMap } from 'rxjs';
import { AttributeHelicopterService } from '../../../module/attribute-helicopter/attribute-helicopter.service';

@Injectable()
export class AttributeHelicopterCreatorGuard implements CanActivate {
  constructor(
    private readonly attributeHelicopterService: AttributeHelicopterService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const creator: User = request.user as User;
    const id: number = +request.params.id;

    return this.attributeHelicopterService
      .findOne(id)
      .pipe(
        switchMap((ah: AttributeHelicopterResponseDto) => {
          if (!ah) {
            return of(false);
          }

          return of(ah.creator.id === creator.id);
        }),
        catchError(() => of(false)),
      )
      .toPromise();
  }
}
