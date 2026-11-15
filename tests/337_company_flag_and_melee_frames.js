// A company's flag and its soldiers' fighting frames stay within their own pictures.
// General group 126 holds the flags as three strips of 9 frames: infantry 0-8, archers 9-17, charioteers 18-26
// (the morale poles follow). The flags started at 0/10/20, so the archer flag's last frame was the charioteers'
// first, and the charioteer flag ran into the poles. Infantry fight with 8 frames (Sprmain group 66 holds 64
// pictures, 8 directions); playing 12 showed frames of group 67, a charioteer, for a third of every swing.
// Markers:
//   [test-marker] flag_frames_own_strip
//   [test-marker] melee_frames_own_group

var T337_FLAG_FRAMES = 9
var T337_SOLDIER_ATTACK = 10 // ACTION_10_SOLDIER_ATTACK

// The company type each flag strip belongs to, in order.
var T337_FLAG_TYPES = [FIGURE_INFANTRY, FIGURE_ARCHER, FIGURE_FCHARIOTEER]

// Archers first: the recruiter serves charioteers, then infantry, then archers, as long as it holds their stock.
var T337_ATTACK_GROUPS = [
    { type: FIGURE_ARCHER, fort: BUILDING_FORT_ARCHERS, group: 63, stock: RESOURCE_NONE },
    { type: FIGURE_INFANTRY, fort: BUILDING_FORT_INFANTRY, group: 66, stock: RESOURCE_WEAPONS },
    { type: FIGURE_FCHARIOTEER, fort: BUILDING_FORT_CHARIOTEERS, group: 69, stock: RESOURCE_CHARIOTS }
]

function t337_place(type) {
    __scenario_building_allow(type, true)
    var bid = test_building_place(type, -1, -1)
    test_planner_exit_build_mode()
    return bid
}

function t337_figures_of_type(type) {
    var out = []
    for (var f = 1; f < 2000; f++) {
        if (__figure_is_valid(f) && __figure_get_type(f) == type) {
            out.push(f)
        }
    }
    return out
}

// Every flag picture over two whole loops lies in its company's strip, and the loop shows all 9 frames.
function t337_check_flags() {
    var base = __test_image_from_desc(PACK_GENERAL, 126, 0)
    var bearers = t337_figures_of_type(FIGURE_STANDARD_BEARER)
    var ok = bearers.length == 3
    var seen = {}
    for (var tick = 0; tick < 6 * T337_FLAG_FRAMES * 2; tick++) {
        __test_figures_update()
        for (var i = 0; i < bearers.length; i++) {
            var strip = T337_FLAG_TYPES.indexOf(__test_formation_figure_type(__test_figure_get_formation_id(bearers[i])))
            var frame = __test_figure_main_image_id(bearers[i]) - base - strip * T337_FLAG_FRAMES
            if (strip < 0 || frame < 0 || frame >= T337_FLAG_FRAMES) {
                if (!seen['bad' + strip]) {
                    __log_info_native('[test:337] flag of company type ' + T337_FLAG_TYPES[strip] + ' shows picture '
                        + (__test_figure_main_image_id(bearers[i]) - base) + ' of group 126 at tick ' + tick)
                }
                ok = false
                seen['bad' + strip] = true
                continue
            }
            seen[strip + ':' + frame] = true
        }
    }
    var shown = Object.keys(seen).filter(function (k) { return k.indexOf('bad') != 0 }).length
    __log_info_native('[test:337] ' + bearers.length + ' flags, ' + shown + ' distinct frames')
    return ok && shown == 3 * T337_FLAG_FRAMES
}

// A soldier fighting a hostile figure shows only pictures of its own attack group.
function t337_check_melee(entry, recruiter) {
    var fort = t337_place(entry.fort)
    __test_fort_update_recruit_status(fort)
    if (entry.stock != RESOURCE_NONE) {
        city.get_building(recruiter).consume_resource(entry.stock, -100)
    }
    var before = t337_figures_of_type(entry.type)
    __test_recruiter_create_soldier(recruiter)
    var after = t337_figures_of_type(entry.type)
    var soldier = 0
    for (var i = 0; i < after.length; i++) {
        if (before.indexOf(after[i]) < 0) {
            soldier = after[i]
        }
    }
    if (!soldier) {
        __log_info_native('[test:337] no soldier of type ' + entry.type)
        return false
    }
    var tile = __figure_get_tile(soldier)
    var foe = test_figure_create(FIGURE_MUMMY, tile.x, tile.y)
    __test_figure_attack_figure_at(soldier, tile.x, tile.y)

    var first = __test_image_from_desc(PACK_SPR_MAIN, entry.group, 0)
    var end = __test_image_from_desc(PACK_SPR_MAIN, entry.group + 1, 0)
    var ticks = 0
    var ok = true
    for (var tick = 0; tick < 24; tick++) {
        __test_figure_action_perform(soldier)
        if (__figure_get_action_state(soldier) != T337_SOLDIER_ATTACK) {
            break
        }
        ticks++
        var img = __test_figure_main_image_id(soldier)
        if (img < first || img >= end) {
            if (ok) {
                __log_info_native('[test:337] soldier type ' + entry.type + ' fighting shows picture ' + (img - first)
                    + ' of group ' + entry.group + ' (holds ' + (end - first) + ') at tick ' + tick)
            }
            ok = false
        }
    }
    __test_figure_kill(foe)
    __log_info_native('[test:337] soldier type ' + entry.type + ' fought ' + ticks + ' ticks')
    return ok && ticks >= 12
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_FORT_GROUND, true)
    var recruiter = t337_place(BUILDING_RECRUITER)

    var melee_ok = true
    for (var i = 0; i < T337_ATTACK_GROUPS.length; i++) {
        melee_ok = t337_check_melee(T337_ATTACK_GROUPS[i], recruiter) && melee_ok
    }
    if (melee_ok) {
        __log_marker('melee_frames_own_group')
    }
    if (t337_check_flags()) {
        __log_marker('flag_frames_own_strip')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] flag_frames_own_strip')
        && __test_find_inlog('[test-marker] melee_frames_own_group')
}
