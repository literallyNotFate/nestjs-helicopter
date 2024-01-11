import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../module/user/entities/user.entity';
import { HelicopterService } from '../../module/helicopter/helicopter.service';
import { HelicopterDto } from '../../module/helicopter/dto/helicopter.dto';
import { catchError, of, switchMap } from 'rxjs';

@Injectable()
export class HelicopterCreatorGuard implements CanActivate {
  constructor(private readonly helicopterService: HelicopterService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const creator: User = request.user as User;
    const id: number = +request.params.id;

    return this.helicopterService
      .findOne(id)
      .pipe(
        switchMap((helicopter: HelicopterDto) => {
          if (!helicopter) {
            return of(false);
          }

          return of(helicopter.creator.id === creator.id);
        }),
        catchError(() => of(false)),
      )
      .toPromise();
  }
}
