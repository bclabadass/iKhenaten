// Brendan, build 14185: on a pyramid the masons "should be chiseling on floor but are currently chiseling on wall" when
// the block arrives, and "seem to fly off the edge of the pyramid when they're done working to head back; in the
// original game the masons disappeared after completing their cycle". A mason working a block on a course uses the
// floor chisel (work_ground), and a mason or a bricklayer walking home from a pyramid's courses is not drawn.
// Markers:
//   [test-marker] t924_floor_chisel
//   [test-marker] t924_mason_leaves_unseen
//   [test-marker] t924_bricklayer_leaves_unseen

function t924_place(type, candidates) {
    for (var i = 0; i < candidates.length; i++) {
        var bid = test_building_place(type, candidates[i].x, candidates[i].y)
        if (bid) {
            return bid
        }
    }
    return test_building_place(type, -1, -1)
}

// A pyramid of the given type in its block phase and a guild of the given type: [pyramid, guild].
function t924_setup(pyramid_type, guild_type) {
    test_reload_city_session('data/default.map')
    __scenario_building_allow(pyramid_type, true)
    __scenario_building_allow(guild_type, true)
    __test_set_treasury(1000000)
    var cx = (__scenario_map.width / 2) | 0
    var cy = (__scenario_map.height / 2) | 0
    var mon = t924_place(pyramid_type, [{ x: cx - 6, y: cy - 6 }, { x: cx, y: cy }, { x: 40, y: 40 }, { x: 30, y: 30 }])
    __test_monument_set_phase(mon, 2)
    __pyramid_start_block_phase(mon)
    var guild = t924_place(guild_type, [])
    __test_building_force_road_access(guild)
    return [mon, guild]
}

// The guild's walker for the pyramid, put next to it (a route home from its footprint isn't what is checked).
function t924_worker(type, mon, guild) {
    __test_building_set_workers(guild, 12)
    __test_building_spawn_figure(guild)
    var fid = __test_first_figure_of_type(type)
    var t = __building_tile(mon)
    if (fid > 0) {
        __test_figure_place(fid, t.x - 2, t.y - 2)
    }
    return fid
}

// Sends the walker home and watches it for up to 40 updates: "alive,seen" = updates it was still walking, and of those
// the ones it was drawn.
function t924_walk_home(fid, action) {
    __test_figure_set_action(fid, action)
    var alive = 0, seen = 0
    for (var k = 0; k < 40; k++) {
        __test_figures_update()
        var v = __test_figure_is_visible(fid)
        if (v < 0) {
            break
        }
        alive++
        seen += v
    }
    return [alive, seen]
}

function run_test() {
    var s = t924_setup(BUILDING_MEDIUM_STEPPED_PYRAMID, BUILDING_STONEMASONS_GUILD)
    var mason = t924_worker(FIGURE_STONEMASON, s[0], s[1])
    __test_figure_set_action(mason, ACTION_21_MASON_PYRAMID_WORK)
    __test_figure_update_animation(mason)
    var work_anim = __test_figure_anim_key(mason)
    var m = t924_walk_home(mason, ACTION_6_MASON_RETURN_HOME)

    s = t924_setup(BUILDING_SMALL_MUDBRICK_PYRAMID, BUILDING_BRICKLAYERS_GUILD)
    var bricklayer = t924_worker(FIGURE_BRICKLAYER, s[0], s[1])
    var b = t924_walk_home(bricklayer, ACTION_3_BRICKLAYER_RETURN_HOME)

    __log_info_native('[test:924] mason ' + mason + ' working a block: ' + work_anim + '; walking home ' + m[0]
        + ' updates, drawn in ' + m[1] + '; bricklayer ' + bricklayer + ' walking home ' + b[0] + ', drawn in ' + b[1])
    if (work_anim == 'work_ground') {
        __log_marker('t924_floor_chisel')
    }
    if (mason > 0 && m[0] > 0 && m[1] == 0) {
        __log_marker('t924_mason_leaves_unseen')
    }
    if (bricklayer > 0 && b[0] > 0 && b[1] == 0) {
        __log_marker('t924_bricklayer_leaves_unseen')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t924_floor_chisel')
        && __test_find_inlog('[test-marker] t924_mason_leaves_unseen')
        && __test_find_inlog('[test-marker] t924_bricklayer_leaves_unseen')
}
