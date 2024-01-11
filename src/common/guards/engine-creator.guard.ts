import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../module/user/entities/user.entity';
import { catchError, of, switchMap } from 'rxjs';
import { EngineDto } from '../../module/engine/dto/engine.dto';
import { EngineService } from '../../module/engine/engine.service';

@Injectable()
export class EngineCreatorGuard implements CanActivate {
  constructor(private readonly engineService: EngineService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const creator: User = request.user as User;
    const id: number = +request.params.id;

    return this.engineService
      .findOne(id)
      .pipe(
        switchMap((engine: EngineDto) => {
          if (!engine) {
            return of(false);
          }

          return of(engine.creator.id === creator.id);
        }),
        catchError(() => of(false)),
      )
      .toPromise();
  }
}
