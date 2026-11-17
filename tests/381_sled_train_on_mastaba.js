// A sled train delivering on a mastaba (laborer, sled, pullers) was drawn at ground level, under the courses
// in front of it (Brendan, build 13854). Any figure on a mastaba tile with courses now stands on top of them and
// draws after the mastaba (bricklayers on their part are centred too, test 377). The lift needs the game's
// images; the draw-order check runs without them.

var __test381_ok = false

function test381_fail(msg) {
    __log_info_native('[test:381] ' + msg)
    __test381_ok = false
    __test_signal_ready()
}

function run_test() {
    __log_info_native('[test:381] sled train on a mastaba')
    test_reload_city_session('data/default.map')
    __scenario_building_allow(BUILDING_SMALL_MASTABA, true)
    __test_set_treasury(500000)

    var cx = (__scenario_map.width / 2) | 0
    var cy = (__scenario_map.height / 2) | 0
    var bid = 0
    var candidates = [{x: cx - 5, y: cy - 2}, {x: cx - 5, y: cy}, {x: 40, y: 40}, {x: 30, y: 30}]
    for (var i = 0; i < candidates.length && !bid; i++) {
        bid = test_building_place(BUILDING_SMALL_MASTABA, candidates[i].x, candidates[i].y)
    }
    if (!bid) {
        return test381_fail('mastaba not placed')
    }
    __test_monument_set_phase(bid, 2)
    __pyramid_start_block_phase(bid)
    __test_mastaba_lay_blocks(bid, 20)

    // A part with courses, not the head.
    var parts = __test_monument_parts(bid).split(',')
    var part = 0
    for (var p = 1; p < parts.length && !part; ++p) {
        var id = parseInt(parts[p])
        if (id && __test_mastaba_part_courses(id) > 0) {
            part = id
        }
    }
    if (!part) {
        return test381_fail('no part with courses after 20 blocks')
    }
    var pt = __building_tile(part)
    __test_camera_center_building(bid)
    __test_pump_frames(3)
    // Created after the frames: a sled with no laborer to follow is removed on the next tick.
    var sled = __test_figure_create(FIGURE_SLED, pt.x + 1, pt.y + 1)
    __test_map_figure_sort_by_y()

    var pos = __test_figure_draw_position(sled).split(',')
    var y = parseInt(pos[1]), sort_y = parseInt(pos[3])
    var bottom = -100000
    for (var m = 0; m < parts.length; ++m) {
        var bid2 = parseInt(parts[m])
        if (!bid2) {
            continue
        }
        var bt = __building_tile(bid2)
        for (var dy = 0; dy < 2; ++dy) {
            for (var dx = 0; dx < 2; ++dx) {
                bottom = Math.max(bottom, __lookup_tile_to_pixel({ x: bt.x + dx, y: bt.y + dy }).y)
            }
        }
    }
    var tile_px = __lookup_tile_to_pixel({ x: pt.x + 1, y: pt.y + 1 })
    var ground_y = tile_px.y + 23
    __log_info_native('[test:381] part ' + part + ' courses ' + __test_mastaba_part_courses(part) + ': sled drawn at y ' + y + ' (ground ' + ground_y + '), sort y ' + sort_y + ', mastaba bottom row ' + bottom)
    if (!(sort_y > bottom)) {
        return test381_fail('the sled sorts at y ' + sort_y + ', before the mastaba front row (' + bottom + '): hidden by the courses')
    }
    if (__test_image_id_from_group(PACK_MASTABA, 1, 0) > 0 && !(y < ground_y - 8)) {
        return test381_fail('the sled is not lifted onto the courses (y ' + y + ', ground ' + ground_y + ')')
    }
    __test381_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test381_ok
}
