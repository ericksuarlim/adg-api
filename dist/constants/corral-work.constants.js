"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORRAL_ACTIVITY_HISTORY_TARGET = exports.CORRAL_VISUAL_CONDITION_CODES = exports.CorralVisualConditionCode = exports.CorralSessionSourceType = exports.CORRAL_ACTIVITY_CODES = exports.CorralActivityCode = exports.CorralWorkSessionStatus = void 0;
var CorralWorkSessionStatus;
(function (CorralWorkSessionStatus) {
    CorralWorkSessionStatus["DRAFT"] = "DRAFT";
    CorralWorkSessionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    CorralWorkSessionStatus["CLOSED"] = "CLOSED";
})(CorralWorkSessionStatus || (exports.CorralWorkSessionStatus = CorralWorkSessionStatus = {}));
/** Catalog of corral activity types (extensible via code). */
var CorralActivityCode;
(function (CorralActivityCode) {
    CorralActivityCode["ATTENDANCE"] = "ATTENDANCE";
    CorralActivityCode["WEIGHING"] = "WEIGHING";
    CorralActivityCode["VACCINATION"] = "VACCINATION";
    CorralActivityCode["IDENTIFICATION"] = "IDENTIFICATION";
    CorralActivityCode["DEWORMING"] = "DEWORMING";
    CorralActivityCode["TREATMENT"] = "TREATMENT";
    CorralActivityCode["INSPECTION"] = "INSPECTION";
})(CorralActivityCode || (exports.CorralActivityCode = CorralActivityCode = {}));
exports.CORRAL_ACTIVITY_CODES = Object.values(CorralActivityCode);
var CorralSessionSourceType;
(function (CorralSessionSourceType) {
    CorralSessionSourceType["PADDOCK"] = "PADDOCK";
    CorralSessionSourceType["FILTER"] = "FILTER";
    CorralSessionSourceType["MANUAL"] = "MANUAL";
})(CorralSessionSourceType || (exports.CorralSessionSourceType = CorralSessionSourceType = {}));
var CorralVisualConditionCode;
(function (CorralVisualConditionCode) {
    CorralVisualConditionCode["NORMAL"] = "NORMAL";
    CorralVisualConditionCode["THIN"] = "THIN";
    CorralVisualConditionCode["VERY_THIN"] = "VERY_THIN";
    CorralVisualConditionCode["FAT"] = "FAT";
    CorralVisualConditionCode["VERY_FAT"] = "VERY_FAT";
    CorralVisualConditionCode["PREGNANT"] = "PREGNANT";
    CorralVisualConditionCode["CLOSE_TO_CALVING"] = "CLOSE_TO_CALVING";
    CorralVisualConditionCode["SICK"] = "SICK";
    CorralVisualConditionCode["INJURED"] = "INJURED";
})(CorralVisualConditionCode || (exports.CorralVisualConditionCode = CorralVisualConditionCode = {}));
exports.CORRAL_VISUAL_CONDITION_CODES = Object.values(CorralVisualConditionCode);
/** Maps activity to the historical module used on session close. */
exports.CORRAL_ACTIVITY_HISTORY_TARGET = {
    [CorralActivityCode.WEIGHING]: 'weight_records',
    [CorralActivityCode.VACCINATION]: 'health_campaign_animals',
    [CorralActivityCode.IDENTIFICATION]: 'animal_identifications',
    [CorralActivityCode.TREATMENT]: 'corral_treatment_entries',
    [CorralActivityCode.DEWORMING]: 'corral_deworming_entries',
};
