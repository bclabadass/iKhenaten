// Monument plots are walked over (Brendan, Meidum): migrants crossed a laid-out stepped pyramid complex as if it were
// open ground. A monument under construction is passable terrain in the citizens' routing grid (its workers come down
// onto it), so any land route took the straight line across the plot. A walker that neither starts nor ends on an
// unfinished monument now routes around it; one going onto the site (a worker) still reaches it.
// The same notes: a laid-out pyramid's stakes looked too small and its NW corner showed grey squares. The stake (the
// original's one-tile SPR_PYR_STAKE) was drawn with the ground, so the grass tufts of the tiles in front hid its lower
// half; it now draws with the walkers. The main part's four tiles took base_img (a ditch tile of the levelling phase)
// where the other parts keep their ground; they keep it now, and a save already showing the ditch tile gets the
// ground back on load. Both are checked in all four views.
// The second part checks Brendan's Meidum 2 save (the complex on the river); without it that part is skipped.
// Markers:
//   [test-marker] t934_map_go_around
//   [test-marker] t934_map_site_drawn
//   [test-marker] t934_save_go_around
//   [test-marker] t934_save_skipped

function t934_site_tiles(path, mains) {
    var n = 0
    var steps = path.split(';')
    for (var i = 0; i < steps.length; i++) {
        if (!steps[i]) {
            continue
        }
        var xy = steps[i].split(',')
        var main = __building_main_id(__building_at(+xy[0], +xy[1]))
        if (main && mains.indexOf(main) >= 0) {
            n++
        }
    }
    return n
}

// Routes a migrant from `from` to `to` and logs how many of its tiles are on the sites; true when it went around.
function t934_goes_around(tag, mains, from, to) {
    var fid = __test_figure_create(FIGURE_IMMIGRANT, from.x, from.y)
    var path = fid ? __test_figure_route_to(fid, to.x, to.y) : ''
    var on_site = t934_site_tiles(path, mains)
    __log_info_native('[test:934] ' + tag + ' migrant ' + fid + ' path ' + path.split(';').length + ' tiles, ' + on_site + ' on the site')
    return path != '' && on_site == 0
}

// A worker going onto the site still gets there.
function t934_reaches_site(tag, from, to) {
    var fid = __test_figure_create(FIGURE_IMMIGRANT, from.x, from.y)
    var path = fid ? __test_figure_route_to(fid, to.x, to.y) : ''
    __log_info_native('[test:934] ' + tag + ' onto the site: ' + (path ? path.split(';').length - 1 : 0) + ' tiles')
    return path != ''
}

// Tiles of the main part still showing a pyramid levelling tile (the grey squares).
function t934_ditch_tiles(main) {
    var t = __building_tile(main)
    var n = 0
    for (var dy = 0; dy < 2; dy++) {
        for (var dx = 0; dx < 2; dx++) {
            if (String(__test_image_info(__test_map_image(t.x + dx, t.y + dy))).indexOf('pyramid phase one') == 0) {
                n++
            }
        }
    }
    return n
}

// In every view: no ditch tile on the main part, and the stake drawn with the walkers (after the ground).
function t934_site_drawn(tag, main) {
    var stake = __test_image_from_path('stepped_pyramid/pyramid_phase_one_00021')
    if (stake <= 0) {
        __log_info_native('[test:934] no pyramid art (run without the game data): drawing not checked')
        return true
    }
    var ok = true
    __camera_sidebar_collapsed(1)
    __camera_rotate_north()
    for (var view = 0; view < 4; view++) {
        __test_camera_center_building(main)
        __test_pump_frames(2)
        __test_render_trace_pass('draw_height_based_tiles')
        __test_pump_frames(1)
        var in_height = __test_render_traced_index(stake)
        __test_render_trace_pass('draw_flat')
        __test_pump_frames(1)
        var in_flat = __test_render_traced_index(stake)
        __test_render_trace_pass('')
        var ditches = t934_ditch_tiles(main)
        __log_info_native('[test:934] ' + tag + ' view ' + view + ': stake in height pass ' + in_height + ', in flat pass ' + in_flat + ', ditch tiles ' + ditches)
        ok = ok && in_height >= 0 && in_flat < 0 && ditches == 0
        __camera_rotate_left()
        __test_pump_frames(2)
    }
    __camera_rotate_north()
    __test_pump_frames(2)
    return ok
}

function t934_map_part() {
    test_ensure_city_session('data/default.map')
    __scenario_building_allow(BUILDING_SMALL_STEPPED_PYRAMID, true)
    __scenario_building_allow(BUILDING_SMALL_MASTABA, true)
    __test_set_treasury(500000)
    var pyr = test_building_place(BUILDING_SMALL_STEPPED_PYRAMID, 60, 30)
    var mas = test_building_place(BUILDING_SMALL_MASTABA, 60, 60)
    if (!pyr || !mas) {
        __log_info_native('[test:934] placing failed: pyramid ' + pyr + ' mastaba ' + mas)
        return false
    }
    __test_pump_frames(2)
    // Small stepped pyramid 8x8 at 60,30; small mastaba 10x4 (or 4x10) at 60,60.
    var ok = t934_goes_around('pyramid', [pyr], { x: 56, y: 34 }, { x: 72, y: 34 })
    ok = t934_goes_around('pyramid n-s', [pyr], { x: 64, y: 26 }, { x: 64, y: 42 }) && ok
    ok = t934_goes_around('mastaba', [mas], { x: 56, y: 61 }, { x: 74, y: 61 }) && ok
    ok = t934_goes_around('mastaba n-s', [mas], { x: 61, y: 56 }, { x: 61, y: 74 }) && ok
    ok = t934_reaches_site('pyramid', { x: 56, y: 34 }, { x: 63, y: 33 }) && ok
    if (t934_site_drawn('pyramid', pyr)) {
        __log_marker('t934_map_site_drawn')
    }
    return ok
}

function t934_save_part() {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Meidum 2.svx')) {
        __log_marker('t934_save_skipped')
        return true
    }
    __test_pump_frames(2)
    var complex = 0
    for (var b = 1; b < 4000 && !complex; b++) {
        if (__building_type(b) == BUILDING_STEPPED_PYRAMID_COMPLEX && __building_main_id(b) == b) {
            complex = b
        }
    }
    if (!complex) {
        __log_info_native('[test:934] no stepped pyramid complex in Meidum 2')
        return false
    }
    var t = __building_tile(complex)
    // The 20x20 plot, crossed west to east (to the strip south of the causeway) and north to south.
    var ok = t934_goes_around('complex', [complex], { x: t.x - 3, y: t.y + 10 }, { x: t.x + 23, y: t.y + 13 })
    ok = t934_goes_around('complex n-s', [complex], { x: t.x + 6, y: t.y - 3 }, { x: t.x + 6, y: t.y + 23 }) && ok
    ok = t934_site_drawn('complex', complex) && ok
    return ok
}

function run_test() {
    if (t934_map_part()) {
        __log_marker('t934_map_go_around')
    }
    if (t934_save_part() && !__test_find_inlog('[test-marker] t934_save_skipped')) {
        __log_marker('t934_save_go_around')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t934_map_go_around')
        && __test_find_inlog('[test-marker] t934_map_site_drawn')
        && (__test_find_inlog('[test-marker] t934_save_go_around') || __test_find_inlog('[test-marker] t934_save_skipped'))
}
