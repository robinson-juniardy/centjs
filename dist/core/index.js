"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadRouters = exports.GetInstance = exports.Delete = exports.Patch = exports.Put = exports.Post = exports.Get = exports.Controller = exports.Methods = void 0;
var express_1 = __importDefault(require("express"));
var multer_1 = __importDefault(require("multer"));
require("reflect-metadata");
var metadata_keys_1 = require("./metadata.keys");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var Methods;
(function (Methods) {
    Methods["get"] = "get";
    Methods["post"] = "post";
    Methods["patch"] = "patch";
    Methods["put"] = "put";
    Methods["delete"] = "delete";
})(Methods = exports.Methods || (exports.Methods = {}));
var Cent = /** @class */ (function () {
    function Cent() {
    }
    Cent.Instance = express_1.default;
    Cent.FormData = (0, multer_1.default)();
    return Cent;
}());
exports.default = Cent;
/**
 * @author Robby Juniardi
 * @description decorator function of controller class
 * @param {string} base_path routing base path
 * @param {Function[]} middleware for add of the specific route middleware
 * @example
 * |@Controller('/', [AuthMiddleware, ...otherMiddleware])
 * |export default class UserController {...}
 */
function Controller(base_path, middleware) {
    return function (target) {
        Reflect.defineMetadata(metadata_keys_1.metadata_keys.basepath, base_path, target);
        Reflect.defineMetadata(metadata_keys_1.metadata_keys.middleware, middleware, target);
    };
}
exports.Controller = Controller;
function methodDecoratorFactory(method) {
    return function (path, middleware) {
        return function (target, propertyKey) {
            var controller = target.constructor;
            var routers = Reflect.hasMetadata(metadata_keys_1.metadata_keys.routers, controller)
                ? Reflect.getMetadata(metadata_keys_1.metadata_keys.routers, controller)
                : [];
            routers.push({
                method: method,
                path: path,
                handlerName: propertyKey,
                middleware: middleware,
            });
            Reflect.defineMetadata(metadata_keys_1.metadata_keys.routers, routers, controller);
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
exports.Get = methodDecoratorFactory(Methods.get);
/**
 * @description Cent API POST Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Post('/users', [MyMiddleware])
 * |public async insert_users(...options){...}
 */
exports.Post = methodDecoratorFactory(Methods.post);
/**
 * @description Cent API PUT Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Put('/users', [MyMiddleware])
 * |public async upload_users(...options){...}
 */
exports.Put = methodDecoratorFactory(Methods.put);
/**
 * @description Cent API PATCH Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Patch('/users', [MyMiddleware])
 * |public async update_users(...options){...}
 */
exports.Patch = methodDecoratorFactory(Methods.patch);
/**
 * @description Cent API DELETE Method
 * @param {string} path define function route
 * @param {any[]} middleware  for add of the specific route middleware
 * @example <caption>used for property of controller class</caption>
 * |@Delete('/users', [MyMiddleware])
 * |public async delete_users(...options){...}
 */
exports.Delete = methodDecoratorFactory(Methods.delete);
function GetInstance(Controller) {
    if (typeof Controller !== "undefined") {
        var RouterMiddleware_1 = Reflect.hasMetadata(metadata_keys_1.metadata_keys.middleware, Controller)
            ? Reflect.getMetadata(metadata_keys_1.metadata_keys.middleware, Controller)
            : undefined;
        var RouterInstance = Reflect.hasMetadata(metadata_keys_1.metadata_keys.routers, Controller)
            ? Reflect.getMetadata(metadata_keys_1.metadata_keys.routers, Controller)
            : [];
        var basePath_1 = Reflect.getMetadata(metadata_keys_1.metadata_keys.basepath, Controller);
        var instances_1 = new Controller();
        var Router_1 = Cent.Instance.Router();
        RouterInstance.forEach(function (instance) {
            if (typeof RouterMiddleware_1 !== "undefined") {
                Router_1[instance.method](basePath_1 + instance.path, Array.isArray(RouterMiddleware_1)
                    ? __spreadArray([], RouterMiddleware_1, true) : RouterMiddleware_1, instances_1[String(instance.handlerName)].bind(instances_1));
            }
            else {
                if (typeof instance.middleware !== "undefined") {
                    Router_1[instance.method](basePath_1 + instance.path, Array.isArray(instance.middleware)
                        ? __spreadArray([], instance.middleware, true) : instance.middleware, instances_1[String(instance.handlerName)].bind(instances_1));
                }
                else {
                    Router_1[instance.method](basePath_1 + instance.path, instances_1[String(instance.handlerName)].bind(instances_1));
                }
            }
        });
        return Router_1;
    }
}
exports.GetInstance = GetInstance;
function LoadRouters(base_module_path) {
    var modulePath = path_1.default.join(process.cwd(), base_module_path);
    var modules = fs_1.default.readdirSync(modulePath);
    var controllerList = [];
    for (var _i = 0, modules_1 = modules; _i < modules_1.length; _i++) {
        var file = modules_1[_i];
        var controller = fs_1.default.readdirSync(path_1.default.join(modulePath, file));
        for (var _a = 0, controller_1 = controller; _a < controller_1.length; _a++) {
            var constructor = controller_1[_a];
            controllerList = controllerList.concat(path_1.default.join(modulePath, file, String(constructor)));
        }
    }
    var routers = [];
    for (var _b = 0, controllerList_1 = controllerList; _b < controllerList_1.length; _b++) {
        var controller = controllerList_1[_b];
        var file = require(controller).default;
        if (typeof file !== "undefined") {
            routers = routers.concat(file);
        }
    }
    var router_list = [];
    for (var _c = 0, routers_1 = routers; _c < routers_1.length; _c++) {
        var instance = routers_1[_c];
        router_list = router_list.concat(GetInstance(instance));
    }
    return router_list;
}
exports.LoadRouters = LoadRouters;
