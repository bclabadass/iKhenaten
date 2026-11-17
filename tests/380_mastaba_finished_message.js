// When a mastaba was finished the game popped up its history page ("message_history_mastaba") instead of the
// completion message. The original says "Mastaba finished!" (eventmsg PHRASE_mastaba_congratulations), as the
// pyramids and other monuments do with their *_congratulations popups (Brendan, build 13854).

var __test380_ok = false

function test380_fail(msg) {
    __log_info_native('[test:380] ' + msg)
    __test380_ok = false
    __test_signal_ready()
}

function test380_message_keys() {
    var keys = []
    for (var i = 0; i < __city_message_count(); i++) {
        keys.push(__lang_get_message_id(__city_message_mm_text_id(i)))
    }
    return keys
}

function run_test() {
    __log_info_native('[test:380] mastaba finished message')
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
        return test380_fail('mastaba not placed')
    }
    __test_monument_set_phase(bid, 2)
    __pyramid_start_block_phase(bid)
    var before = test380_message_keys().length
    __test_mastaba_lay_blocks(bid, 0)
    for (var d = 0; d < 40 && __test_monument_phase(bid) != -1; ++d) {
        __test_run_ticks(50)
    }
    if (__test_monument_phase(bid) != -1) {
        return test380_fail('mastaba not finished, phase ' + __test_monument_phase(bid))
    }
    var keys = test380_message_keys().slice(before)
    __log_info_native('[test:380] messages posted on finishing: ' + keys.join(', '))
    var congrats = 0
    for (var k = 0; k < keys.length; ++k) {
        if (keys[k] == 'message_history_mastaba') {
            return test380_fail('the history page popped up instead of the completion message')
        }
        if (keys[k] == 'mastaba_congratulations') {
            congrats++
        }
    }
    if (congrats != 1) {
        return test380_fail(congrats + ' "Mastaba finished!" messages, want 1')
    }
    __test380_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test380_ok
}
