import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../module/user/entities/user.entity';
import { of, switchMap } from 'rxjs';
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
          return engine ? of(engine.creator.id === creator.id) : of(false);
        }),
      )
      .toPromise();
  }
}
