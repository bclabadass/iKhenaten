// While the first brick course is laid (phase 2, block engine running) each 2x2 mastaba part draws the ground
// under it; a part's own map tile covers only one of its four tiles. The overlay was skipped when the block
// engine was active, and that state is keyed by the head part, so only the head lost it: three black tiles at
// the mastaba's corner (Brendan's Abdjedu 16). Needs the game's images; skipped without them.

var __test374_ok = false

function test374_fail(msg) {
    __log_info_native('[test:374] ' + msg)
    __test374_ok = false
    __test_signal_ready()
}

function run_test() {
    __log_info_native('[test:374] mastaba head part keeps its ground')
    test_reload_city_session('data/default.map')
    if (!(__test_image_id_from_group(PACK_MASTABA, 2, 0) > 0)) {
        __log_marker('mastaba_ground_skipped_no_images')
        __test374_ok = true
        __test_signal_ready()
        return
    }
    __scenario_building_allow(BUILDING_SMALL_MASTABA, true)
    __test_set_treasury(500000)

    var cx = (__scenario_map.width / 2) | 0
    var cy = (__scenario_map.height / 2) | 0
    var bid = 0
    var candidates = [{x: cx - 4, y: cy - 4}, {x: cx, y: cy}, {x: 40, y: 40}, {x: 30, y: 30}]
    for (var i = 0; i < candidates.length && !bid; i++) {
        bid = test_building_place(BUILDING_SMALL_MASTABA, candidates[i].x, candidates[i].y)
    }
    if (!bid) {
        return test374_fail('mastaba not placed')
    }
    __test_monument_set_phase(bid, 2)
    __pyramid_start_block_phase(bid)
    if (!(__pyramid_remaining_blocks(bid) > 0)) {
        return test374_fail('block phase did not start')
    }

    // As in a real game when the block phase starts: no tile of the course is laid yet, and the parts' map
    // tiles hold the levelled ground.
    var tile = __building_tile(bid)
    var ground = __test_image_id_from_group(PACK_MASTABA, 2, 8)
    __test_monument_set_all_progress(bid, 0)
    for (var gy = 0; gy < 2; ++gy) {
        for (var gx = 0; gx < 2; ++gx) {
            __map_image_set({ x: tile.x + gx, y: tile.y + gy }, ground)
        }
    }

    __test_camera_center_building(bid)
    __test_pump_frames(30)

    // The camera is centred on the mastaba, far from the map edge: nothing in the middle of the view is pure
    // black unless a tile is left undrawn.
    var black = 0
    var first = ''
    // Inside the city view: pixels past the screen's edge read as black, and so does the minimap's margin.
    var max_x = Math.min(900, __test_viewport_width() - 1)
    var max_y = Math.min(650, screen.height - 1)
    for (var y = 150; y <= max_y; y += 5) {
        for (var x = 150; x <= max_x; x += 5) {
            if (__test_screen_pixel(x, y) == 0) {
                black++
                if (!first) {
                    first = x + ',' + y
                }
            }
        }
    }
    __log_info_native('[test:374] black samples in the view: ' + black + (first ? ' (first at ' + first + ')' : ''))
    // An undrawn tile is about 70 samples (the bug left three); a few black pixels of art (a figure's outline) are not.
    if (black > 10) {
        return test374_fail('undrawn (black) ground at the mastaba: ' + black + ' samples')
    }
    __log_marker('mastaba_ground_ok')
    __test374_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test374_ok && (__test_find_inlog('[test-marker] mastaba_ground_ok') || __test_find_inlog('[test-marker] mastaba_ground_skipped_no_images'))
}
