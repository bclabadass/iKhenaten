// Mastaba under construction (Brendan, 2026-11-16):
// - In the original each block shows as it is laid. The courses were drawn from the monument's phase, so a
//   whole course appeared at once when its last block came; now each 2x2 part shows its own courses.
// - Bricklayers on the mastaba were drawn at ground level on a part's corner tile, under the courses in front
//   of them; now a bricklayer on a part stands in its middle, on top of its courses, and draws after the
//   mastaba.
// Needs the game's images for the pictures; the draw-order check runs without them.

var __test377_ok = false

function test377_fail(msg) {
    __log_info_native('[test:377] ' + msg)
    __test377_ok = false
    __test_signal_ready()
}

function run_test() {
    __log_info_native('[test:377] mastaba blocks one by one, bricklayers on top')
    test_reload_city_session('data/default.map')
    __scenario_building_allow(BUILDING_SMALL_MASTABA, true)
    __scenario_building_allow(BUILDING_BRICKLAYERS_GUILD, true)
    __test_set_treasury(500000)

    var cx = (__scenario_map.width / 2) | 0
    var cy = (__scenario_map.height / 2) | 0
    var bid = 0
    var candidates = [{x: cx - 5, y: cy - 2}, {x: cx - 5, y: cy}, {x: 40, y: 40}, {x: 30, y: 30}]
    for (var i = 0; i < candidates.length && !bid; i++) {
        bid = test_building_place(BUILDING_SMALL_MASTABA, candidates[i].x, candidates[i].y)
    }
    if (!bid) {
        return test377_fail('mastaba not placed')
    }
    __test_monument_set_phase(bid, 2)
    __pyramid_start_block_phase(bid)

    var parts = []
    var list = __test_monument_parts(bid).split(',')
    for (var p = 0; p < list.length; ++p) {
        if (parseInt(list[p])) {
            parts.push(parseInt(list[p]))
        }
    }

    // Three blocks: the parts that got one rise, the others stay at the ground.
    if (__test_mastaba_lay_blocks(bid, 3) != 3) {
        return test377_fail('could not lay 3 blocks')
    }
    var have_art = __test_image_id_from_group(PACK_MASTABA, 1, 0) > 0
    if (have_art) {
        var ground = 0, bricks = 0
        for (var k = 0; k < parts.length; ++k) {
            var t = __building_tile(parts[k])
            var name = __test_image_info(__test_map_image_at(t.x, t.y))
            if (name.indexOf('pyramid phase one') == 0) {
                ground++
            } else if (name.indexOf('mastaba') == 0) {
                bricks++
            }
        }
        __log_info_native('[test:377] after 3 blocks: ' + bricks + ' parts show bricks, ' + ground + ' still show the levelled ground (of ' + parts.length + ')')
        if (ground < parts.length - 3 || bricks < 1) {
            return test377_fail('after 3 of 9 blocks ' + bricks + ' parts show bricks and ' + ground + ' the ground: courses do not follow the blocks laid')
        }
    } else {
        __log_marker('mastaba_blocks_pictures_skipped_no_images')
    }

    // A bricklayer waiting on a part draws after the whole mastaba, inside its footprint.
    var tile = __building_tile(bid)
    var guild = test_building_place(BUILDING_BRICKLAYERS_GUILD, tile.x + 14, tile.y) || test_building_place(BUILDING_BRICKLAYERS_GUILD, -1, -1)
    var fid = __test_figure_create(FIGURE_BRICKLAYER, tile.x, tile.y + 3)
    __test_figure_set_home(fid, guild)
    city.get_building(bid).add_workers(fid)
    var part = __pyramid_claim_bricklayer_task(fid)
    if (!part) {
        return test377_fail('bricklayer claimed no part')
    }
    __test_figure_set_action(fid, ACTION_8_BRICKLAYER_WAIT_FOR_BLOCK)
    var ptile = __building_tile(part)
    __test_figure_place(fid, ptile.x, ptile.y)
    __test_camera_center_building(bid)
    __test_pump_frames(3)
    __test_map_figure_sort_by_y()

    var pos = __test_figure_draw_position(fid).split(',')
    var px = parseInt(pos[0]), py = parseInt(pos[1]), sort_y = parseInt(pos[3])
    var bottom = -100000
    var mon_tiles = __test_monument_parts(bid).split(',')
    for (var m = 0; m < mon_tiles.length; ++m) {
        var id = parseInt(mon_tiles[m])
        if (!id) {
            continue
        }
        var bt = __building_tile(id)
        for (var dy = 0; dy < 2; ++dy) {
            for (var dx = 0; dx < 2; ++dx) {
                bottom = Math.max(bottom, __lookup_tile_to_pixel({ x: bt.x + dx, y: bt.y + dy }).y)
            }
        }
    }
    // The part's middle: its four tile corners averaged, half a tile in.
    var c = { x: 0, y: 0 }
    for (var qy = 0; qy < 2; ++qy) {
        for (var qx = 0; qx < 2; ++qx) {
            var q = __lookup_tile_to_pixel({ x: ptile.x + qx, y: ptile.y + qy })
            c.x += q.x / 4
            c.y += q.y / 4
        }
    }
    __log_info_native('[test:377] bricklayer drawn at ' + px + ',' + py + ' sort y ' + sort_y + '; part middle ' + (c.x + 29) + ',' + (c.y + 15) + '; mastaba bottom row y ' + bottom)
    if (!(sort_y > bottom)) {
        return test377_fail('bricklayer sorts at y ' + sort_y + ', before the mastaba rows in front of it (bottom ' + bottom + '): hidden by the courses')
    }
    if (Math.abs(px - (c.x + 29)) > 2) {
        return test377_fail('bricklayer x ' + px + ' is off the middle of its part (' + (c.x + 29) + ')')
    }

    __test377_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test377_ok
}
