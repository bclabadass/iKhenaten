// Troops on a transport land where a tap says. After Disembark the next tap on the map picks the landing; it took
// only a tap on a land tile right at the water's edge, so on a touch screen a tap on the water or a little inland
// did nothing (Brendan on the Duo: unboarding troops doesn't work). The landing is now the shore tile nearest the
// tap, within a few tiles, on land or water. And a tap picking a company to board takes the nearest company.
// Markers:
//   [test-marker] landing_tap_on_water
//   [test-marker] landing_tap_inland
//   [test-marker] troops_land_after_tap
//   [test-marker] tap_far_from_shore_ignored

var T358_GOING_TO_LANDING = 219

function t358_tap(p) {
    __test_touch_down(1, p.x, p.y)
    __test_pump_frames(2)
    __test_touch_up(1, p.x, p.y)
    __test_pump_frames(6)
}

function t358_tile_pixel(t) {
    for (var py = 40; py < screen.height - 40; py += 3) {
        for (var px = 10; px < screen.width - 200; px += 6) {
            var st = __pixel_to_screentile({ x: px, y: py })
            if (st.x == -1 || st.y == -1) {
                continue
            }
            var at = __screen_to_tile(st)
            if (at.x == t.x && at.y == t.y) {
                return { x: px, y: py }
            }
        }
    }
    return null
}

function t358_is_water(t) {
    return __map_terrain_is(t, TERRAIN_WATER)
}

// Chebyshev distance to the nearest water tile, up to 8.
function t358_water_distance(t) {
    for (var r = 0; r <= 8; r++) {
        for (var dy = -r; dy <= r; dy++) {
            for (var dx = -r; dx <= r; dx++) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) == r && t358_is_water({ x: t.x + dx, y: t.y + dy })) {
                    return r
                }
            }
        }
    }
    return 99
}

// A clear land tile at the given distance from the water, near the strip.
function t358_land_at(cx, cy, want) {
    for (var r = 1; r <= 12; r++) {
        for (var dy = -r; dy <= r; dy++) {
            for (var dx = -r; dx <= r; dx++) {
                var t = { x: cx + dx, y: cy + dy }
                if (!t358_is_water(t) && !__map_terrain_is(t, TERRAIN_BUILDING) && t358_water_distance(t) == want) {
                    return t
                }
            }
        }
    }
    return null
}

// Pick the landing with a tap on the tile; the ship's action after (219 is going to its landing). Paused, so the
// ship doesn't sail and land before it's read.
function t358_pick_landing(ship, t) {
    game.paused = true
    __test_figure_set_action(ship, ACTION_213_TRANSPORT_SHIP_DOCKED)
    __window_city_transport_show(ship, TRANSPORT_PICK_LANDING)
    __test_pump_frames(3)
    city.camera_go_to(t)
    __test_pump_frames(3)
    var p = t358_tile_pixel(t)
    if (!p) {
        __log_info_native('[test:358] tile ' + t.x + ',' + t.y + ' not on screen')
        game.paused = false
        return -1
    }
    t358_tap(p)
    var action = __figure_get_action_state(ship)
    game.paused = false
    return action
}

function run_test() {
    test_reload_city_session('data/default.map')
    var ship = __test_player_transport_spawn_for_embark(4)
    var company = __test_player_transport_company_id()
    if (!ship || !company) {
        __log_info_native('[test:358] setup failed')
        __test_signal_ready()
        return
    }
    __transport_ship_embark(ship, company)
    for (var i = 0; i < 40 && !__transport_ship_has_troops(ship); i++) {
        __test_figure_action_perform(ship)
    }
    if (!__transport_ship_has_troops(ship)) {
        __log_info_native('[test:358] embark failed')
        __test_signal_ready()
        return
    }
    var cx = __test_player_transport_water_x()
    var cy = __test_player_transport_water_y()
    var ship_tile = __figure_get_tile(ship)

    // Open water, a tile from the ship.
    var water = null
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0]]
    for (var d = 0; d < dirs.length && !water; d++) {
        var w = { x: ship_tile.x + dirs[d][0], y: ship_tile.y + dirs[d][1] }
        if (t358_is_water(w)) {
            water = w
        }
    }
    var on_water = water ? t358_pick_landing(ship, water) : -1
    __log_info_native('[test:358] tap on water ' + JSON.stringify(water) + ': ship action ' + on_water)
    if (on_water == T358_GOING_TO_LANDING) {
        __log_marker('landing_tap_on_water')
    }

    var inland = t358_land_at(cx, cy, 3)
    var on_inland = inland ? t358_pick_landing(ship, inland) : -1
    __log_info_native('[test:358] tap 3 tiles inland ' + JSON.stringify(inland) + ': ship action ' + on_inland)
    if (on_inland == T358_GOING_TO_LANDING) {
        __log_marker('landing_tap_inland')
    }

    var far = t358_land_at(cx, cy, 7)
    var on_far = far ? t358_pick_landing(ship, far) : -1
    __log_info_native('[test:358] tap 7 tiles inland ' + JSON.stringify(far) + ': ship action ' + on_far)
    if (far && on_far == ACTION_213_TRANSPORT_SHIP_DOCKED) {
        __log_marker('tap_far_from_shore_ignored')
    }

    // The inland tap's landing, carried through.
    if (inland && t358_pick_landing(ship, inland) == T358_GOING_TO_LANDING) {
        __test_transport_ship_snap_to_destination(ship)
        for (var j = 0; j < 20 && __transport_ship_has_troops(ship); j++) {
            __test_figure_action_perform(ship)
        }
    }
    __log_info_native('[test:358] troops still aboard after landing: ' + __transport_ship_has_troops(ship))
    if (inland && !__transport_ship_has_troops(ship)) {
        __log_marker('troops_land_after_tap')
    }
    ui.window_city_show()
    __test_pump_frames(2)
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] landing_tap_on_water')
        && __test_find_inlog('[test-marker] landing_tap_inland')
        && __test_find_inlog('[test-marker] troops_land_after_tap')
        && __test_find_inlog('[test-marker] tap_far_from_shore_ignored')
}
