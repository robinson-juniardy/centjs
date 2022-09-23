import express, { Request as ExRequest, Response as ExResponse, NextFunction, Handler as Exhandler } from "express";
import multer from "multer";
import "reflect-metadata";
export declare enum Methods {
    get = "get",
    post = "post",
    patch = "patch",
    put = "put",
    delete = "delete"
}
export declare type Request = ExRequest;
export declare type Response = ExResponse;
export declare type Next = NextFunction;
export declare type Handler = Exhandler;
export declare type MethodHandler = "get" | "post" | "put" | "patch" | "delete";
export interface IRouter {
    method: MethodHandler;
    path: string;
    handlerName: string | symbol;
    middleware?: any;
}
export default abstract class Cent {
    static Instance: typeof express;
    static FormData: multer.Multer;
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
export declare function Controller<T extends string>(base_path: T, middleware?: any | any[]): ClassDecorator;
/**
 * @description Cent API GET Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Get('/users', [MyMiddleware])
 * |public async get_users(...options){...}
 */
export declare const Get: (path: string, middleware?: any | any[]) => MethodDecorator;
/**
 * @description Cent API POST Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Post('/users', [MyMiddleware])
 * |public async insert_users(...options){...}
 */
export declare const Post: (path: string, middleware?: any | any[]) => MethodDecorator;
/**
 * @description Cent API PUT Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Put('/users', [MyMiddleware])
 * |public async upload_users(...options){...}
 */
export declare const Put: (path: string, middleware?: any | any[]) => MethodDecorator;
/**
 * @description Cent API PATCH Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Patch('/users', [MyMiddleware])
 * |public async update_users(...options){...}
 */
export declare const Patch: (path: string, middleware?: any | any[]) => MethodDecorator;
/**
 * @description Cent API DELETE Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Delete('/users', [MyMiddleware])
 * |public async delete_users(...options){...}
 */
export declare const Delete: (path: string, middleware?: any | any[]) => MethodDecorator;
export declare function GetInstance<constructor>(Controller: new (...args: any[]) => constructor): import("express-serve-static-core").Router;
export declare function LoadRouters<T extends string>(base_module_path: T): any[];
//# sourceMappingURL=index.d.ts.map