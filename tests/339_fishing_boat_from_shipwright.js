// A fishing boat built at a shipwright sails to a wharf instead of sinking. The shipwright launches the boat with
// itself as the boat's home; the boat's (OG) action took any home that wasn't a fishing wharf as lost and sank the
// boat on its first tick. Its corpse then ran the boat's action again every tick, and each run sank it again: a new
// wreck every tick (Abdjedu on the Duo: 5 dead boats at the shipwright and ~150 wrecks drawing images 0-35 over the
// river). Now, as in the original, a new boat waits by the shipwright, claims a fishing wharf without a boat, and
// sails to it; a boat with no home or wharf is removed, and only damage sinks it, once. Pharaoh has no wreck
// pictures, so the wreck stays unseen while the boat shows its own sinking animation.
// Markers:
//   [test-marker] new_boat_waits_without_wharf
//   [test-marker] new_boat_claims_wharf
//   [test-marker] sunk_boat_leaves_one_wreck
//   [test-marker] wreck_unseen_and_gone

var T339_ACTION_CREATED = 0
var T339_ACTION_GOING_TO_WHARF = 3

function t339_count(type) {
    var n = 0
    for (var f = 1; f < 2000; f++) {
        if (__figure_is_valid(f) && __figure_get_type(f) == type) {
            n++
        }
    }
    return n
}

function t339_wrecks() {
    var out = []
    for (var f = 1; f < 2000; f++) {
        if (__figure_is_valid(f) && __figure_get_type(f) == FIGURE_SHIPWRECK) {
            out.push(f)
        }
    }
    return out
}

function t339_ticks(fid, n) {
    for (var i = 0; i < n; i++) {
        __test_figure_action_perform(fid)
    }
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    var yard = test_shoreline_building_place(BUILDING_SHIPWRIGHT, 3)
    if (!yard) {
        __log_info_native('[test:339] shipwright place failed')
        __test_signal_ready()
        return
    }
    // Open water beside the shipwright, where it launches its boats.
    var wt = __building_tile(yard)
    var water = null
    for (var dy = -2; dy <= 5 && !water; dy++) {
        for (var dx = -2; dx <= 5 && !water; dx++) {
            var t = { x: wt.x + dx, y: wt.y + dy }
            if (terrain.is(t, TERRAIN_WATER) && !terrain.is(t, TERRAIN_BUILDING)) {
                water = t
            }
        }
    }
    if (!water) {
        __log_info_native('[test:339] no open water beside the shipwright')
        __test_signal_ready()
        return
    }

    // Launched the way building_shipyard does: home the shipwright, in its boat slot, just created.
    var boat = test_figure_create(FIGURE_FISHING_BOAT, water.x, water.y)
    __test_figure_set_home(boat, yard)
    __test_building_set_figure_slot(yard, BUILDING_SLOT_BOAT, boat)
    __test_figure_set_action(boat, T339_ACTION_CREATED)

    t339_ticks(boat, 120)
    var waiting = __test_figure_is_alive(boat) && __figure_get_action_state(boat) == T339_ACTION_CREATED
    __log_info_native('[test:339] no wharf: boat alive ' + __test_figure_is_alive(boat) + ' action '
        + __figure_get_action_state(boat) + ', wrecks ' + t339_wrecks().length)
    if (waiting && t339_wrecks().length == 0) {
        __log_marker('new_boat_waits_without_wharf')
    }

    var wharf = __test_building_create(BUILDING_FISHING_WHARF, wt.x + 6, wt.y + 6)
    for (var i = 0; i < 60 && __figure_get_action_state(boat) == T339_ACTION_CREATED; i++) {
        __test_figure_action_perform(boat)
    }
    __log_info_native('[test:339] wharf ' + wharf + ': boat action ' + __figure_get_action_state(boat) + ' home '
        + __figure_get_home_building_id(boat) + ', wharf boat ' + __test_building_figure_id(wharf, BUILDING_SLOT_BOAT)
        + ', shipwright boat ' + __test_building_figure_id(yard, BUILDING_SLOT_BOAT))
    if (wharf && __figure_get_action_state(boat) == T339_ACTION_GOING_TO_WHARF
        && __figure_get_home_building_id(boat) == wharf
        && __test_building_figure_id(wharf, BUILDING_SLOT_BOAT) == boat
        && __test_building_figure_id(yard, BUILDING_SLOT_BOAT) == 0) {
        __log_marker('new_boat_claims_wharf')
    }

    // Whole game ticks: the dead boat must not sink again on every one.
    __test_figure_set_damage(boat, 1000)
    for (var i = 0; i < 20; i++) {
        __test_figures_update()
    }
    var wrecks = t339_wrecks()
    __log_info_native('[test:339] after sinking: boat dying ' + __test_figure_is_dying(boat) + ', wrecks ' + wrecks.length)
    if (__test_figure_is_dying(boat) && wrecks.length == 1) {
        __log_marker('sunk_boat_leaves_one_wreck')
    }

    var unseen = wrecks.length == 1 && !__test_figure_is_visible(wrecks[0])
    for (var i = 0; i < 40 && wrecks.length == 1; i++) {
        __test_figure_action_perform(wrecks[0])
        if (__test_figure_is_alive(wrecks[0]) && __test_figure_is_visible(wrecks[0])) {
            unseen = false
        }
    }
    var left = wrecks.length == 1 ? __test_figure_is_alive(wrecks[0]) : -1
    __log_info_native('[test:339] wreck unseen ' + unseen + ', still there after 40 ticks ' + left)
    if (unseen && left == 0) {
        __log_marker('wreck_unseen_and_gone')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] new_boat_waits_without_wharf')
        && __test_find_inlog('[test-marker] new_boat_claims_wharf')
        && __test_find_inlog('[test-marker] sunk_boat_leaves_one_wreck')
        && __test_find_inlog('[test-marker] wreck_unseen_and_gone')
}
