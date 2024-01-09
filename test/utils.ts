import { CanActivate } from '@nestjs/common';

export function isGuarded(
  route: ((...args: any[]) => any) | (new (...args: any[]) => unknown),
  guardType: new (...args: any[]) => CanActivate,
) {
  const guards: any[] = Reflect.getMetadata('__guards__', route);

  if (!guards) {
    throw Error(
      `Expected: ${route.name} to be protected with ${guardType.name}\nReceived: No guard`,
    );
  }

  let foundGuard = false;
  const guardList: string[] = [];

  guards.forEach((guard) => {
    guardList.push(guard.name);
    if (guard.name === guardType.name) foundGuard = true;
  });

  if (!foundGuard) {
    throw Error(
      `Expected: ${route.name} to be protected with ${guardType.name}\nReceived: only ${guardList}`,
    );
  }

  return true;
}
