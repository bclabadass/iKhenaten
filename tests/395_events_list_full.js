// Mission scripts add events as they go (Selima: a luxury request and its four outcomes every two years, a timber
// demand every year) and the list holds 150. On the Duo, Selima VI reached 150; the next event went past the end,
// wrote over the list's size and the save schema, and no save could be written again ("chunk 60 (scenario_events)
// has no io_buffer"). A full list now reuses a slot that can't matter again (a spent one-shot, or a chain child only
// spent events lead to), and drops the event when there is none, so the list never overflows.
// Markers:
//   [test-marker] events_full_reuses_spent_slot
//   [test-marker] events_full_drops_without_overflow

var __test395_ok = false

function t395_fail(msg) {
    __log_info_native('[test:395] FAIL ' + msg)
    __test_signal_ready()
}

function t395_fill(tag0, spent) {
    var tag = tag0
    while (__test_events_count() < 150) {
        city.create_chain_event({ tag_id: tag, type: EVENT_TYPE_REPUTATION_INCREASE, amount: 1 })
        var id = __test_event_id_by_tag(tag)
        if (id < 0) {
            return -1
        }
        __test_event_set_trigger(id, spent ? 4 : 1)
        tag++
    }
    return tag
}

function run_test() {
    __log_info_native('[test:395] events list full')

    test_reload_city_session('data/default.map')
    if (t395_fill(5000, true) < 0) {
        return t395_fail('fill with spent events')
    }
    city.create_chain_event({ tag_id: 7777, type: EVENT_TYPE_REPUTATION_DECREASE, amount: 1 })
    var count = __test_events_count()
    var id = __test_event_id_by_tag(7777)
    var saved = __game_write_savegame('t395.svx')
    __log_info_native('[test:395] spent list: count ' + count + ', new event at ' + id + ', save ' + saved)
    if (count != 150 || id <= 0 || !saved) {
        return t395_fail('spent list: count ' + count + ' id ' + id + ' save ' + saved)
    }
    __log_marker('events_full_reuses_spent_slot')

    test_reload_city_session('data/default.map')
    if (t395_fill(6000, false) < 0) {
        return t395_fail('fill with live events')
    }
    city.create_chain_event({ tag_id: 8888, type: EVENT_TYPE_REPUTATION_DECREASE, amount: 1 })
    count = __test_events_count()
    id = __test_event_id_by_tag(8888)
    saved = __game_write_savegame('t395.svx')
    __game_delete_savegame('t395.svx')
    __log_info_native('[test:395] live list: count ' + count + ', new event at ' + id + ', save ' + saved)
    if (count != 150 || id != -1 || !saved) {
        return t395_fail('live list: count ' + count + ' id ' + id + ' save ' + saved)
    }
    __log_marker('events_full_drops_without_overflow')

    __test395_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test395_ok && __test_find_inlog('[test-marker] events_full_reuses_spent_slot')
        && __test_find_inlog('[test-marker] events_full_drops_without_overflow')
}
