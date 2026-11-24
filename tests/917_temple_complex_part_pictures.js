// A temple complex's three big pictures (Brendan, to-do 2b: "the altar and oracle visuals"). The pack draws the complex
// by depth: the tall temple on the part farthest from the camera, the colonnade in the middle, the shrine on the
// nearest part, all in the same axis, each facing along the complex (frame 0 when the complex runs down-right on
// screen; Brendan, build 14176: every piece was turned 90 degrees); a built altar changes the colonnade, a built
// oracle the shrine. The parts took
// their facing from the planner's Rotate setting (turning it for a statue redrew the complex), and with the camera
// or the complex turned the temple stood in front of the colonnade or showed twice.
// Markers:
//   [test-marker] t917_by_depth_every_view
//   [test-marker] t917_planner_rotation_ignored
//   [test-marker] t917_upgrades_drawn
//   [test-marker] t917_pieces_face_along_complex
//   [test-marker] t917_no_data_skipped

function t917_img(group, offset) {
    return __test_image_id_from_group(PACK_TEMPLE_SETH, group, offset)
}

function t917_place(type, x, y, taps) {
    test_planner_enter_build_mode(type)
    for (var r = 0; r < taps; r++) {
        emit event_rotate_building{ value: 1 }
        __test_process_events()
    }
    city_planner.update(x, y)
    city_planner.construction_start(x, y)
    city_planner.construction_update(x, y)
    city_planner.construction_finalize()
    var bid = city_planner.last_created_building_id()
    test_planner_exit_build_mode()
    return bid
}

// The three parts from farthest to nearest, with the picture on each.
function t917_parts(bid) {
    var ids = [bid]
    var b = city.get_building(bid)
    while (b && b.next_part_building_id > 0 && ids.length < 3) {
        ids.push(b.next_part_building_id)
        b = city.get_building(b.next_part_building_id)
    }
    var parts = []
    for (var i = 0; i < ids.length; i++) {
        var t = city.get_building(ids[i]).tile
        var screen = __camera_tile_to_screen({ x: t.x + 1, y: t.y + 1 })
        parts.push({ id: ids[i], x: screen.x, depth: screen.y, image: __test_map_image(t.x, t.y) })
    }
    parts.sort(function (a, b) { return a.depth - b.depth })
    return parts
}

// Which axis (0 or 1) the pictures are in, or -1 if they aren't back/middle/front (or the upgrades) of one axis.
function t917_axis(parts, altar, oracle) {
    for (var axis = 0; axis < 2; axis++) {
        var off = axis * 3
        var middle = altar ? t917_img(7, axis) : t917_img(2, off)
        var front = oracle ? t917_img(7, 2 + axis) : t917_img(3, off)
        if (parts.length == 3 && parts[0].image == t917_img(1, off) && parts[1].image == middle && parts[2].image == front) {
            return axis
        }
    }
    return -1
}

function t917_images(parts) {
    var out = []
    for (var i = 0; i < parts.length; i++) {
        out.push(parts[i].image)
    }
    return out.join('/')
}

function run_test() {
    if (!__test_image_exists(t917_img(1, 0))) {
        __log_marker('t917_no_data_skipped')
        __test_signal_ready()
        return
    }
    var by_depth = true
    var along = true
    var ignores_planner = true
    var upgrades = true
    var report = []
    for (var taps = 0; taps < 4; taps++) {
        for (var camera = 0; camera < 2; camera++) {
            test_reload_city_session('data/default.map')
            __test_set_treasury(1000000)
            for (var c = 0; c < camera; c++) {
                __camera_rotate_right()
            }
            var bid = t917_place(BUILDING_TEMPLE_COMPLEX_SETH, 60, 60, taps)
            var t = city.get_building(bid).tile
            var placed = t917_parts(bid)
            var axis = t917_axis(placed, false, false)
            var runs_down_right = placed.length == 3 && placed[2].x > placed[0].x

            test_planner_enter_build_mode(BUILDING_SMALL_STATUE)
            emit event_rotate_building{ value: 1 }
            __test_process_events()
            test_planner_exit_build_mode()
            __camera_rotate_right()
            __camera_rotate_left()
            var after_statue = t917_parts(bid)

            __camera_rotate_right()
            var turned = t917_axis(t917_parts(bid), false, false)
            __camera_rotate_left()

            t917_place(BUILDING_TEMPLE_COMPLEX_ALTAR_ANUBIS, t.x, t.y, 0)
            var with_altar = t917_axis(t917_parts(bid), true, false)
            t917_place(BUILDING_TEMPLE_COMPLEX_ORACLE_SEKHMET, t.x, t.y, 0)
            var with_oracle = t917_axis(t917_parts(bid), true, true)

            along = along && axis >= 0 && runs_down_right == (axis == 0)
            by_depth = by_depth && axis >= 0 && turned >= 0 && turned != axis
            ignores_planner = ignores_planner && t917_images(placed) == t917_images(after_statue)
            upgrades = upgrades && with_altar == axis && with_oracle == axis && axis >= 0
            report.push('taps ' + taps + ' cam ' + camera + ': axis ' + axis + (runs_down_right ? ' down-right' : ' down-left') + ' turned ' + turned + ' altar ' + with_altar
                + ' oracle ' + with_oracle + ' [' + t917_images(placed) + '] -> [' + t917_images(after_statue) + ']')
        }
    }
    __log_info_native('[test:917] ' + report.join('; '))
    if (by_depth) {
        __log_marker('t917_by_depth_every_view')
    }
    if (ignores_planner) {
        __log_marker('t917_planner_rotation_ignored')
    }
    if (upgrades) {
        __log_marker('t917_upgrades_drawn')
    }
    if (along) {
        __log_marker('t917_pieces_face_along_complex')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t917_no_data_skipped')
        || (__test_find_inlog('[test-marker] t917_by_depth_every_view')
            && __test_find_inlog('[test-marker] t917_planner_rotation_ignored')
            && __test_find_inlog('[test-marker] t917_upgrades_drawn')
            && __test_find_inlog('[test-marker] t917_pieces_face_along_complex'))
}
