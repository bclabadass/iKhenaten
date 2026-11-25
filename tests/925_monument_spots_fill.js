// Monuments other than the stone pyramids fill their work spots too (Brendan, 2026-11-24: "implement the same fix for
// the other monuments as well"). Bricklayers on a (medium) mudbrick pyramid's or a mastaba's course: the guild kept up to four
// out and the monument took five (its worker slots); now the guild keeps sending them while the course has a part one
// can claim (he claims it as he leaves). The sphinx's stage: each guild kept one mason out, so one guild never filled a
// stage with three spots; now it sends another once the last one has reached his spot, until none is free.
// Markers:
//   [test-marker] t925_mudbrick_course_filled
//   [test-marker] t925_mastaba_course_filled
//   [test-marker] t925_sphinx_spots_filled

function t925_place(type, candidates) {
    for (var i = 0; i < candidates.length; i++) {
        var bid = test_building_place(type, candidates[i].x, candidates[i].y)
        if (bid) {
            return bid
        }
    }
    return test_building_place(type, -1, -1)
}

// Sends bricklayers from one staffed guild until it stops: "sent,open part after".
function t925_bricklayer_course(type) {
    test_reload_city_session('data/default.map')
    __scenario_building_allow(type, true)
    __scenario_building_allow(BUILDING_BRICKLAYERS_GUILD, true)
    __test_set_treasury(1000000)
    var cx = (__scenario_map.width / 2) | 0
    var cy = (__scenario_map.height / 2) | 0
    var mon = t925_place(type, [{ x: cx - 5, y: cy - 2 }, { x: cx - 4, y: cy - 4 }, { x: 40, y: 40 }, { x: 30, y: 30 }])
    __test_monument_set_phase(mon, 2)
    __pyramid_start_block_phase(mon)
    var guild = t925_place(BUILDING_BRICKLAYERS_GUILD, [])
    __test_building_set_workers(guild, 100)
    for (var i = 0; i < 200; i++) {
        __test_building_spawn_figure(guild)
    }
    return [mon && guild ? __test_count_figures(FIGURE_BRICKLAYER) : -1, __test_open_bricklayer_part(mon)]
}

function run_test() {
    var mud = t925_bricklayer_course(BUILDING_MEDIUM_MUDBRICK_PYRAMID)
    var mastaba = t925_bricklayer_course(BUILDING_SMALL_MASTABA)

    game_features.set('gameplay_sphinx_artisans', false)
    test_reload_city_session('data/default.map')
    __scenario_building_allow(BUILDING_SPHINX, true)
    __scenario_building_allow(BUILDING_STONEMASONS_GUILD, true)
    __test_set_treasury(100000)
    var cx = (__scenario_map.width / 2) | 0
    var cy = (__scenario_map.height / 2) | 0
    var sphinx = t925_place(BUILDING_SPHINX, [{ x: cx - 9, y: cy - 3 }, { x: 30, y: 30 }, { x: 40, y: 40 }, { x: 60, y: 40 }])
    var guild = t925_place(BUILDING_STONEMASONS_GUILD, [])
    __test_building_set_workers(guild, 12)
    __test_sphinx_set_stage(sphinx, 4)
    // Each round: the guild gets a few chances to send, then whoever came reaches a spot.
    var sent = []
    for (var round = 0; round < 6; round++) {
        for (var k = 0; k < 3; k++) {
            __test_building_spawn_figure(guild)
        }
        for (var fid = 1; fid < 400; fid++) {
            if (sent.indexOf(fid) < 0 && __test_figure_type(fid) == FIGURE_STONEMASON
                && __test_figure_get_action(fid) == ACTION_0_MASON_CREATED) {
                sent.push(fid)
                __test_figure_set_action(fid, ACTION_9_MASON_WORK_OBELISK)
                __test_sphinx_work(sphinx, fid)
            }
        }
    }
    var masons = __test_count_figures(FIGURE_STONEMASON)
    var free = __test_sphinx_has_spot(sphinx, FIGURE_STONEMASON)

    __log_info_native('[test:925] mudbrick pyramid: ' + mud[0] + ' bricklayers sent, open part after ' + mud[1]
        + '; mastaba: ' + mastaba[0] + ' sent, open part after ' + mastaba[1] + '; sphinx stage 4: ' + masons
        + ' masons, free spot left ' + free)
    if (mud[0] > 5 && mud[1] == 0) {
        __log_marker('t925_mudbrick_course_filled')
    }
    if (mastaba[0] > 5 && mastaba[1] == 0) {
        __log_marker('t925_mastaba_course_filled')
    }
    if (masons == 3 && !free) {
        __log_marker('t925_sphinx_spots_filled')
    }
    __test_game_feature_reset('gameplay_sphinx_artisans')
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t925_mudbrick_course_filled')
        && __test_find_inlog('[test-marker] t925_mastaba_course_filled')
        && __test_find_inlog('[test-marker] t925_sphinx_spots_filled')
}
