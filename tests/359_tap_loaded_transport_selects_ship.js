// A tap on a transport carrying troops selects the ship, not the company on board (Brendan on the Duo: with troops
// aboard, a tap on the transport showed the company's Orders and Rotate buttons, so there was no way to the ship's
// Disembark). The soldiers aboard are off the map but the company's standard stands on the ship, and a tap looked
// for a company within two tiles before looking for a ship. Ships on the tapped tile now come first, and a company
// on a transport isn't picked from the map. Selecting a company also took a tap up to two tiles off, which felt too
// far: it is one tile now (picking a company to board still allows two).
// Markers:
//   [test-marker] loaded_transport_tap_selects_ship
//   [test-marker] company_tap_one_tile_off
//   [test-marker] company_tap_two_tiles_off_ignored

function t359_tap(p) {
    __test_touch_down(1, p.x, p.y)
    __test_pump_frames(2)
    __test_touch_up(1, p.x, p.y)
    __test_pump_frames(6)
}

function t359_tile_pixel(t) {
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

// Tap the tile from the city view; the window after.
function t359_tap_tile(t) {
    ui.window_city_show()
    __test_pump_frames(2)
    city.camera_go_to(t)
    __test_pump_frames(3)
    var p = t359_tile_pixel(t)
    if (!p) {
        return 'off screen'
    }
    t359_tap(p)
    return __game_window_get_id()
}

function t359_place(type, x, y) {
    if (!__scenario_building_allowed(type)) {
        __scenario_building_allow(type, true)
    }
    var bid = test_building_place(type, x, y)
    test_planner_exit_build_mode()
    return bid
}

function t359_loaded_transport() {
    test_reload_city_session('data/default.map')
    var ship = __test_player_transport_spawn_for_embark(4)
    var company = __test_player_transport_company_id()
    if (!ship || !company) {
        __log_info_native('[test:359] transport setup failed')
        return
    }
    __transport_ship_embark(ship, company)
    for (var i = 0; i < 40 && !__transport_ship_has_troops(ship); i++) {
        __test_figure_action_perform(ship)
    }
    // The company's standard, which goes to the company's standard tile: the ship's, while it is aboard.
    var flag = test_figure_create(FIGURE_STANDARD_BEARER, __figure_get_tile(ship).x, __figure_get_tile(ship).y - 2)
    __test_figure_set_formation_id(flag, company)
    __test_figure_action_perform(flag)
    var flag_tile = __figure_get_tile(flag)
    __log_info_native('[test:359] standard at ' + JSON.stringify(flag_tile) + ', ship at ' + JSON.stringify(__figure_get_tile(ship)))
    // Paused, so the troops stay aboard until the tap.
    game.paused = true
    var window = t359_tap_tile(__figure_get_tile(ship))
    game.paused = false
    __log_info_native('[test:359] troops aboard ' + __transport_ship_has_troops(ship) + ', tap on the ship opens ' + window)
    if (__transport_ship_has_troops(ship) && window == 'window_city_transport') {
        __log_marker('loaded_transport_tap_selects_ship')
    }
    ui.window_city_show()
    __test_pump_frames(2)
}

function t359_occupied(tiles, t) {
    for (var i = 0; i < tiles.length; i++) {
        if (tiles[i].x == t.x && tiles[i].y == t.y) {
            return true
        }
    }
    return false
}

// A clear tile exactly `dist` tiles (Chebyshev) from the nearest soldier.
function t359_tile_off(tiles, dist) {
    for (var i = 0; i < tiles.length; i++) {
        for (var dy = -dist; dy <= dist; dy++) {
            for (var dx = -dist; dx <= dist; dx++) {
                var c = { x: tiles[i].x + dx, y: tiles[i].y + dy }
                if (Math.max(Math.abs(dx), Math.abs(dy)) != dist || __map_terrain_is(c, TERRAIN_BUILDING)) {
                    continue
                }
                var nearest = 99
                for (var j = 0; j < tiles.length; j++) {
                    nearest = Math.min(nearest, Math.max(Math.abs(tiles[j].x - c.x), Math.abs(tiles[j].y - c.y)))
                }
                if (nearest == dist) {
                    return c
                }
            }
        }
    }
    return null
}

function t359_company_radius() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_FORT_GROUND, true)
    var recruiter = t359_place(BUILDING_RECRUITER, 36, 40)
    var archers = t359_place(BUILDING_FORT_ARCHERS, 44, 40)
    __test_fort_update_recruit_status(archers)
    for (var i = 0; i < 3; i++) {
        __test_recruiter_create_soldier(recruiter)
    }
    var tiles = []
    var cx = (__scenario_map.width / 2) | 0, cy = (__scenario_map.height / 2) | 0
    for (var q = 1; q < 3000; q++) {
        if (__figure_is_valid(q) && __figure_get_type(q) == FIGURE_ARCHER) {
            var t = { x: cx - 12 + tiles.length, y: cy - 6 }
            __test_figure_place(q, t.x, t.y)
            __test_figure_set_action(q, 0)
            tiles.push(t)
        }
    }
    __test_pump_frames(2)
    for (var f = 1; f < 3000; f++) {
        if (__figure_is_valid(f) && __figure_get_type(f) == FIGURE_STANDARD_BEARER) {
            tiles.push(__figure_get_tile(f))
        }
    }
    var one = t359_tile_off(tiles, 1)
    var two = t359_tile_off(tiles, 2)
    game.paused = true
    var w2 = two ? t359_tap_tile(two) : 'none'
    var w1 = one ? t359_tap_tile(one) : 'none'
    game.paused = false
    __log_info_native('[test:359] company at ' + JSON.stringify(tiles) + ': tap 1 off ' + JSON.stringify(one) + ' opens '
        + w1 + ', tap 2 off ' + JSON.stringify(two) + ' opens ' + w2)
    if (w1 == 'window_city_military') {
        __log_marker('company_tap_one_tile_off')
    }
    if (two && w2 != 'window_city_military' && w2 != 'off screen') {
        __log_marker('company_tap_two_tiles_off_ignored')
    }
    ui.window_city_show()
    __test_pump_frames(2)
}

function run_test() {
    t359_loaded_transport()
    t359_company_radius()
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] loaded_transport_tap_selects_ship')
        && __test_find_inlog('[test-marker] company_tap_one_tile_off')
        && __test_find_inlog('[test-marker] company_tap_two_tiles_off_ignored')
}
