// A laborer that finished at a monument (ground levelled, nothing left to level) went idle but kept the
// monument as its destination. GOING_OUT then took the "destination already assigned" shortcut, walked
// straight back, found nothing to level and went idle again, for ever: it never ran find_work, so no blocks
// were brought to the waiting bricklayers and the camp's four laborer slots stayed taken
// (Brendan's Abdjedu 16 save: 12 laborers circling on three mastabas, 20 bricklayers waiting).
// An idle laborer now drops its destination and looks for work afresh.

var __test373_ok = false

function test373_fail(msg) {
    __log_info_native('[test:373] ' + msg)
    __test373_ok = false
    __test_signal_ready()
}

function run_test() {
    __log_info_native('[test:373] idle laborer looks for work')
    test_reload_city_session('data/default.map')
    __scenario_building_allow(BUILDING_SMALL_MASTABA, true)
    __scenario_building_allow(BUILDING_WORK_CAMP, true)
    __test_set_treasury(500000)

    var cx = (__scenario_map.width / 2) | 0
    var cy = (__scenario_map.height / 2) | 0
    var bid = 0
    var candidates = [{x: cx - 4, y: cy - 4}, {x: cx, y: cy}, {x: 40, y: 40}, {x: 30, y: 30}]
    for (var i = 0; i < candidates.length && !bid; i++) {
        bid = test_building_place(BUILDING_SMALL_MASTABA, candidates[i].x, candidates[i].y)
    }
    if (!bid) {
        return test373_fail('mastaba not placed')
    }
    var tile = __building_tile(bid)
    var camp = test_building_place(BUILDING_WORK_CAMP, tile.x + 16, tile.y) || test_building_place(BUILDING_WORK_CAMP, -1, -1)
    if (!camp) {
        return test373_fail('work camp not placed')
    }
    var ctile = __building_tile(camp)
    __test_make_road(ctile.x + 1, ctile.y)
    __test_building_set_road_access(camp, ctile.x + 1, ctile.y)
    __test_building_set_workers(camp, 20)

    // The ground is levelled and the block phase runs: nothing for a laborer to level here.
    __test_monument_set_all_progress(bid, 200)
    __test_monument_set_phase(bid, 3)

    // A laborer arriving at the site with it as destination, as one that just levelled its last tile.
    var fid = __test_figure_create(FIGURE_LABORER, tile.x, tile.y)
    __test_figure_set_home_slot(fid, camp)
    __test_figure_set_destination_building(fid, bid)
    __test_figure_set_action(fid, 10)

    var idle_seen = false
    var dest_when_idle = -1
    var states = ''
    for (var t = 0; t < 400 && __test_figure_is_alive(fid); t++) {
        __test_figures_update()
        if (!__test_figure_is_alive(fid)) {
            break
        }
        var act = __figure_get_action_state(fid)
        if (t < 12) {
            states += ' ' + act + '/' + __figure_get_destination_building_id(fid)
        }
        if (act == 8 && !idle_seen) {
            idle_seen = true
            dest_when_idle = __figure_get_destination_building_id(fid)
        }
    }
    var alive = __test_figure_is_alive(fid) ? 1 : 0
    __log_info_native('[test:373] first ticks (action/destination):' + states + '; idle seen ' + idle_seen + ' with destination ' + dest_when_idle + '; alive after 400 ticks ' + alive)
    if (!idle_seen) {
        return test373_fail('the laborer never went idle at the finished site')
    }
    if (dest_when_idle != 0) {
        return test373_fail('idle laborer kept destination ' + dest_when_idle)
    }
    // With no bricklayer waiting there is no work: find_work lets the laborer go (OG), freeing its camp slot.
    if (alive) {
        return test373_fail('the laborer still circles after 400 ticks, action ' + __figure_get_action_state(fid))
    }

    __test373_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test373_ok
}
