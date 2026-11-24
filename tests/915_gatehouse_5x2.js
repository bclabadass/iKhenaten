// The gatehouse is one building, 5x2 along the wall: a 2x2 statue pylon, the 1x2 gate the road runs through and
// another pylon (Brendan, Serabit Khadim: gatehouses drew as wall boxes, shrine frames or black, and the menu offered
// five kinds). Placing one lays the whole 5x2, the Rotate button turns it to run along the other axis, and a map's
// bare gatehouse terrain (Serabit's outpost) becomes that building when the mission starts.
// Markers:
//   [test-marker] t915_placed_5x2_every_view
//   [test-marker] t915_rotate_turns_it
//   [test-marker] t915_map_gatehouse_built
//   [test-marker] t915_no_data_skipped

var T915_TILE = { x: 60, y: 60 }

function t915_tap(p) {
    __test_touch_down(1, p.x, p.y)
    __test_pump_frames(2)
    __test_touch_up(1, p.x, p.y)
    __test_pump_frames(4)
}

// The gatehouse tiles around `c`: their box, how many carry the road, and how many buildings own them.
function t915_box(c, type) {
    var min_x = 999, min_y = 999, max_x = -1, max_y = -1, n = 0, road = 0
    var ids = {}
    for (var y = c.y - 5; y <= c.y + 5; y++) {
        for (var x = c.x - 5; x <= c.x + 5; x++) {
            var bid = __building_at(x, y)
            if (!bid || __building_type(bid) != type || !terrain.is({ x: x, y: y }, TERRAIN_GATEHOUSE)) {
                continue
            }
            n++
            ids[bid] = true
            road += terrain.is({ x: x, y: y }, TERRAIN_ROAD) ? 1 : 0
            min_x = Math.min(min_x, x); max_x = Math.max(max_x, x)
            min_y = Math.min(min_y, y); max_y = Math.max(max_y, y)
        }
    }
    return { n: n, w: max_x - min_x + 1, h: max_y - min_y + 1, road: road, parts: Object.keys(ids).length }
}

function t915_shape_ok(box, axis) {
    var w = axis == 0 ? 5 : 2
    var h = axis == 0 ? 2 : 5
    return box.n == 10 && box.w == w && box.h == h && box.road == 2 && box.parts == 4
}

function t915_place(camera, taps) {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    for (var c = 0; c < camera; c++) {
        __camera_rotate_right()
    }
    __test_pump_frames(1)
    test_planner_enter_build_mode(BUILDING_MUD_GATEHOUSE)
    __test_pump_frames(2)
    var button = __test_construction_rotate_button_width() > 0
    for (var t = 0; t < taps; t++) {
        t915_tap(__test_construction_rotate_button_pos())
    }
    var axis = (city_planner.relative_orientation + camera) % 2
    city_planner.update(T915_TILE.x, T915_TILE.y)
    var can = city_planner.can_be_placed()
    city_planner.construction_start(T915_TILE.x, T915_TILE.y)
    city_planner.construction_update(T915_TILE.x, T915_TILE.y)
    city_planner.construction_finalize()
    test_planner_exit_build_mode()
    var box = t915_box(T915_TILE, BUILDING_MUD_GATEHOUSE)
    return { button: button, can: can, axis: axis, box: box, ok: can == CAN_PLACE && t915_shape_ok(box, axis) }
}

function run_test() {
    var manual_prev = game_features.get('gameui_rotate_manually')
    game_features.set('gameui_rotate_manually', false)
    var all_ok = true
    var turns = true
    var report = []
    for (var camera = 0; camera < 4; camera++) {
        var a = t915_place(camera, 0)
        var b = t915_place(camera, 1)
        all_ok = all_ok && a.ok && b.ok
        turns = turns && a.button && a.axis != b.axis
        report.push('cam' + camera + ' ' + JSON.stringify(a) + ' / ' + JSON.stringify(b))
    }
    game_features.set('gameui_rotate_manually', manual_prev)
    __log_info_native('[test:915] ' + report.join('\n'))
    if (all_ok) {
        __log_marker('t915_placed_5x2_every_view')
    }
    if (all_ok && turns) {
        __log_marker('t915_rotate_turns_it')
    }

    if (!__test_image_exists(__test_image_id_from_group(PACK_GENERAL, 213, 0))) {
        __log_marker('t915_no_data_skipped')
        test_reload_city_session('data/default.map')
        __test_signal_ready()
        return
    }
    __game_load_mission(11, 1)
    __test_pump_frames(3)
    ui.window_city_show()
    __test_pump_frames(3)
    var gate = __building_at(39, 75)
    var box = t915_box({ x: 39, y: 75 }, BUILDING_DECORATIVE_GATEHOUSE)
    var pylon_art = __test_image_info(__test_map_image(37, 75))
    var gate_art = __test_image_info(__test_map_image(39, 76))
    __log_info_native('[test:915] Serabit gate ' + gate + ' type ' + __building_type(gate) + ' ' + JSON.stringify(box)
        + ' pylon [' + pylon_art + '] gate [' + gate_art + ']')
    if (t915_shape_ok(box, 0) && pylon_art.indexOf('Wall_God1') == 0 && gate_art.indexOf('Wall_God1') == 0) {
        __log_marker('t915_map_gatehouse_built')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t915_placed_5x2_every_view')
        && __test_find_inlog('[test-marker] t915_rotate_turns_it')
        && (__test_find_inlog('[test-marker] t915_map_gatehouse_built')
            || __test_find_inlog('[test-marker] t915_no_data_skipped'))
}
