import express, {
  Request as ExRequest,
  Response as ExResponse,
  NextFunction,
  Router as ExRouter,
  Handler as Exhandler,
} from "express";
import multer from "multer";
import "reflect-metadata";
import { metadata_keys } from "./metadata.keys";
import path from "path";
import fs from "fs";

export enum Methods {
  get = "get",
  post = "post",
  patch = "patch",
  put = "put",
  delete = "delete",
}

export type Request = ExRequest;
export type Response = ExResponse;
export type Next = NextFunction;
export type Handler = Exhandler;

export type MethodHandler = "get" | "post" | "put" | "patch" | "delete";

export interface IRouter {
  method: MethodHandler;
  path: string;
  handlerName: string | symbol;
  middleware?: any;
}

export default abstract class Cent {
  public static Instance = express;
  public static FormData = multer();
}

/**
 * @author Robby Juniardi
 * @description decorator function of controller class
 * @param {string} base_path routing base path
 * @param {Function[]} middleware for add of the specific route middleware
 * @example
 * |@Controller('/', [AuthMiddleware, ...otherMiddleware])
 * |export default class UserController {...}
 */

export function Controller<T extends string>(
  base_path: T,
  middleware?: any | any[]
): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(metadata_keys.basepath, base_path, target);
    Reflect.defineMetadata(metadata_keys.middleware, middleware, target);
  };
}

function methodDecoratorFactory<M extends Methods>(method: M) {
  return (path: string, middleware?: any | any[]): MethodDecorator => {
    return (target: any, propertyKey: string) => {
      const controller = target.constructor;

      const routers: IRouter[] = Reflect.hasMetadata(
        metadata_keys.routers,
        controller
      )
        ? Reflect.getMetadata(metadata_keys.routers, controller)
        : [];

      routers.push({
        method: method,
        path,
        handlerName: propertyKey,
        middleware: middleware,
      });

      Reflect.defineMetadata(metadata_keys.routers, routers, controller);
    };
  };
}

/**
 * @description Cent API GET Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Get('/users', [MyMiddleware])
 * |public async get_users(...options){...}
 */
export const Get = methodDecoratorFactory(Methods.get);

/**
 * @description Cent API POST Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Post('/users', [MyMiddleware])
 * |public async insert_users(...options){...}
 */
export const Post = methodDecoratorFactory(Methods.post);

/**
 * @description Cent API PUT Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Put('/users', [MyMiddleware])
 * |public async upload_users(...options){...}
 */
export const Put = methodDecoratorFactory(Methods.put);

/**
 * @description Cent API PATCH Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Patch('/users', [MyMiddleware])
 * |public async update_users(...options){...}
 */
export const Patch = methodDecoratorFactory(Methods.patch);

/**
 * @description Cent API DELETE Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Delete('/users', [MyMiddleware])
 * |public async delete_users(...options){...}
 */
export const Delete = methodDecoratorFactory(Methods.delete);

export function GetInstance<constructor>(
  Controller: new (...args: any[]) => constructor
) {
  if (typeof Controller !== "undefined") {
    const RouterMiddleware = Reflect.hasMetadata(
      metadata_keys.middleware,
      Controller
    )
      ? Reflect.getMetadata(metadata_keys.middleware, Controller)
      : undefined;
    const RouterInstance: IRouter[] = Reflect.hasMetadata(
      metadata_keys.routers,
      Controller
    )
      ? Reflect.getMetadata(metadata_keys.routers, Controller)
      : [];
    const basePath = Reflect.getMetadata(metadata_keys.basepath, Controller);

    const instances: {
      [propertyKey: string]: Handler;
    } = new Controller() as any;

    const Router = Cent.Instance.Router();

    RouterInstance.forEach((instance) => {
      if (typeof RouterMiddleware !== "undefined") {
        Router[instance.method](
          basePath + instance.path,
          Array.isArray(RouterMiddleware)
            ? [...RouterMiddleware]
            : RouterMiddleware,
          instances[String(instance.handlerName)].bind(instances)
        );
      } else {
        if (typeof instance.middleware !== "undefined") {
          Router[instance.method](
            basePath + instance.path,
            Array.isArray(instance.middleware)
              ? [...instance.middleware]
              : instance.middleware,
            instances[String(instance.handlerName)].bind(instances)
          );
        } else {
          Router[instance.method](
            basePath + instance.path,
            instances[String(instance.handlerName)].bind(instances)
          );
        }
      }
    });

    return Router;
  }
}

export function LoadRouters<T extends string>(base_module_path: T) {
  const modulePath = path.join(process.cwd(), base_module_path);
  const modules = fs.readdirSync(modulePath);

  let controllerList: Array<any> = [];
  for (let file of modules) {
    const controller = fs.readdirSync(path.join(modulePath, file));
    for (let constructor of controller) {
      controllerList = controllerList.concat(
        path.join(modulePath, file, String(constructor))
      );
    }
  }

  let routers: Array<any> = [];

  for (let controller of controllerList) {
    let file = require(controller).default;

    if (typeof file !== "undefined") {
      routers = routers.concat(file);
    }
  }

  let router_list: Array<any> = [];
  for (let instance of routers) {
    router_list = router_list.concat(GetInstance(instance));
  }
  return router_list;
}
