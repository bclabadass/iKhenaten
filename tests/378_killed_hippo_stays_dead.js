// A hippo killed in the middle of a fight went on to its own attack handler the next tick, which "resumed" the
// action it had before the fight (a chase) although it was dying. It then stood there for ever, spinning, as
// the chase timer undid the corpse timer each tick (Brendan's Abdjedu 18: two hippos near the bazaar,
// damage 253/250, state dying, action 21). A dying figure now stays a corpse and is removed after its delay.

var __test378_ok = false

function test378_fail(msg) {
    __log_info_native('[test:378] ' + msg)
    __test378_ok = false
    __test_signal_ready()
}

function run_test() {
    __log_info_native('[test:378] killed hippo stays dead')
    test_reload_city_session('data/default.map')
    city.figures.remove_figures(FIGURE_HIPPO)

    var hippo = test_figure_create(FIGURE_HIPPO, 40, 40)
    var soldier = test_figure_create(FIGURE_INFANTRY, 40, 40)
    if (!hippo || !soldier) {
        return test378_fail('figures not created')
    }
    // Chasing, then the fight starts on the shared tile.
    __test_figure_set_action(hippo, 21)
    __test_figure_set_wait_ticks(hippo, 50)
    __test_figure_combat_attack_at(hippo, 40, 40)
    if (!__test_figure_in_attack(hippo)) {
        return test378_fail('the hippo did not start a fight')
    }
    // The soldier's blow kills it.
    __test_figure_kill(hippo)

    var gone = -1
    var actions = ''
    for (var t = 0; t < 2000 && gone < 0; ++t) {
        __test_run_ticks(1)
        if (t < 6) {
            actions += ' ' + __figure_get_action_state(hippo) + '/w' + __figure_get_wait_ticks(hippo) + '/atk' + __test_figure_in_attack(hippo)
        }
        if (!__test_figure_is_alive(hippo) && __figure_get_state(hippo) != 3) {
            gone = t
        }
    }
    __log_info_native('[test:378] actions after the kill:' + actions + '; removed after ' + gone + ' ticks (state ' + __figure_get_state(hippo) + ')')
    if (gone < 0) {
        return test378_fail('the killed hippo was still there after 2000 ticks, action ' + __figure_get_action_state(hippo))
    }
    __test378_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test378_ok
}
