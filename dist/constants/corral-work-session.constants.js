"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORRAL_PLANNED_ACTIVITY_TYPES = exports.CorralPlannedActivityType = exports.CorralWorkSessionStatus = void 0;
var CorralWorkSessionStatus;
(function (CorralWorkSessionStatus) {
    CorralWorkSessionStatus["DRAFT"] = "DRAFT";
    CorralWorkSessionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    CorralWorkSessionStatus["CLOSED"] = "CLOSED";
})(CorralWorkSessionStatus || (exports.CorralWorkSessionStatus = CorralWorkSessionStatus = {}));
var CorralPlannedActivityType;
(function (CorralPlannedActivityType) {
    CorralPlannedActivityType["ATTENDANCE"] = "ATTENDANCE";
    CorralPlannedActivityType["HEALTH"] = "HEALTH";
    CorralPlannedActivityType["PADDOCK_REORGANIZATION"] = "PADDOCK_REORGANIZATION";
})(CorralPlannedActivityType || (exports.CorralPlannedActivityType = CorralPlannedActivityType = {}));
exports.CORRAL_PLANNED_ACTIVITY_TYPES = Object.values(CorralPlannedActivityType);
