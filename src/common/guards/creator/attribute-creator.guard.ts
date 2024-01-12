import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../../module/user/entities/user.entity';
import { catchError, of, switchMap } from 'rxjs';
import { AttributesService } from '../../../module/attributes/attributes.service';
import { AttributesDto } from '../../../module/attributes/dto/attributes.dto';

@Injectable()
export class AttributeCreatorGuard implements CanActivate {
  constructor(private readonly attributeService: AttributesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const creator: User = request.user as User;
    const id: number = +request.params.id;

    return this.attributeService
      .findOne(id)
      .pipe(
        switchMap((attribute: AttributesDto) => {
          if (!attribute) {
            return of(false);
          }

          return of(attribute.creator.id === creator.id);
        }),
        catchError(() => of(false)),
      )
      .toPromise();
  }
}
