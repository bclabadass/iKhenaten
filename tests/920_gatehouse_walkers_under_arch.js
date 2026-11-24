// Gatehouse follow-up (build 14175): a walker in the gate was drawn over the arch. The original draws the gate's door
// frame again over walkers (Pharaoh_General group 220, a cut-out of the front gate picture); now the gatehouse does too,
// in every camera view: gate, then the walker in the doorway, then the door frame, and a walker that has left the gate
// over all of it.
// Markers:
//   [test-marker] t920_walkers_under_arch
//   [test-marker] t920_no_data_skipped

var T920_GATE = { x: 60, y: 60 }

// Progress 7 and 8 put the walker at the two opposite edges of his tile (7 px up or down the screen).
function t920_trace(fid, x, y, progress) {
    __test_figure_place(fid, x, y)
    __test_figure_set_direction(fid, 0)
    __test_figure_set_progress_on_tile(fid, progress)
    __test_figure_update_animation(fid)
    __test_figure_refresh_image(fid)
    __test_pump_frames(2)
    __test_render_trace_pass('draw_height_based_tiles')
    __test_pump_frames(1)
    __test_render_trace_pass('')
    return __test_render_traced_index(__test_figure_main_image_id(fid))
}

function run_test() {
    var front = __test_image_id_from_group(PACK_GENERAL, 218, 0)
    var cover = __test_image_id_from_group(PACK_GENERAL, 220, 0)
    if (!__test_image_exists(front) || !__test_image_exists(cover)) {
        __log_marker('t920_no_data_skipped')
        __test_signal_ready()
        return
    }
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    var manual_prev = game_features.get('gameui_rotate_manually')
    game_features.set('gameui_rotate_manually', false)
    __camera_rotate_north()
    __test_pump_frames(1)
    test_planner_enter_build_mode(BUILDING_MUD_GATEHOUSE)
    __test_pump_frames(2)
    city_planner.update(T920_GATE.x, T920_GATE.y)
    city_planner.construction_start(T920_GATE.x, T920_GATE.y)
    city_planner.construction_update(T920_GATE.x, T920_GATE.y)
    city_planner.construction_finalize()
    test_planner_exit_build_mode()
    game_features.set('gameui_rotate_manually', manual_prev)

    var fid = __test_figure_create(FIGURE_LABOR_SEEKER, T920_GATE.x, T920_GATE.y + 2)
    game.paused = true
    __camera_sidebar_collapsed(1)
    var ok = fid > 0
    var report = []
    for (var cam = 0; cam < 4; cam++) {
        __camera_go_to_bookmark_tile(T920_GATE)
        __test_pump_frames(3)
        var a = { x: T920_GATE.x, y: T920_GATE.y }
        var b = { x: T920_GATE.x, y: T920_GATE.y + 1 }
        var frame_a = __test_map_image(a.x, a.y) - front
        var near = (frame_a == 0 || frame_a == 1) ? a : b
        var far = near === a ? b : a
        var frame = __test_map_image(near.x, near.y) - front
        var outside = { x: 2 * near.x - far.x, y: 2 * near.y - far.y }
        var in_gate = t920_trace(fid, near.x, near.y, 0)
        var gate_at = __test_render_traced_index(front + frame)
        var cover_at = __test_render_traced_index(cover + frame)
        var good = (frame == 0 || frame == 1) && gate_at >= 0 && gate_at < in_gate && in_gate < cover_at
        var line = 'cam' + cam + ' near ' + near.x + ',' + near.y + ' frame ' + frame + ' gate ' + gate_at + ' walker '
            + in_gate + ' cover ' + cover_at
        // On the gate tile's front edge he stands in the doorway, under the frame; on its back edge he is inside the
        // passage, behind the gate picture.
        var doorway = 0, passage = 0
        for (var edge = 7; edge <= 8; edge++) {
            var w = t920_trace(fid, near.x, near.y, edge)
            var g = __test_render_traced_index(front + frame)
            var c = __test_render_traced_index(cover + frame)
            doorway += (g < w && w < c) ? 1 : 0
            passage += (w < g) ? 1 : 0
            line += ' | gate edge ' + edge + ': gate ' + g + ' walker ' + w + ' cover ' + c
        }
        good = good && doorway == 1 && passage == 1
        for (var progress = 7; progress <= 8; progress++) {
            var out_walker = t920_trace(fid, outside.x, outside.y, progress)
            var out_cover = __test_render_traced_index(cover + frame)
            good = good && out_cover >= 0 && out_cover < out_walker
            line += ' | outside ' + progress + ': cover ' + out_cover + ' walker ' + out_walker
        }
        ok = ok && good
        report.push(line + (good ? '' : ' BAD'))
        __camera_rotate_left()
        __test_pump_frames(3)
    }
    __camera_rotate_north()
    game.paused = false
    __log_info_native('[test:920] front ' + front + ' cover ' + cover + ': ' + report.join('; '))
    if (ok) {
        __log_marker('t920_walkers_under_arch')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t920_walkers_under_arch')
        || __test_find_inlog('[test-marker] t920_no_data_skipped')
}
