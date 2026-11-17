// A patrolling warship rams every tick it can. With no enemy ship on its tile or the tile ahead,
// find_ram_target() returned 0 and figure_get(0) gave the empty slot 0 (never null), so the ram damaged that
// slot and, once its damage passed the limit, killed it through a null figure_impl: signal 11 on the Duo
// (Brendan, build 13851, patrolling near a fishing spot). The evade and face-enemy steps had the same lookup
// and steered from or towards tile 0,0. With no target the warship now does nothing.

var __test376_ok = false

function test376_fail(msg) {
    __log_info_native('[test:376] ' + msg)
    __test376_ok = false
    __test_signal_ready()
}

function run_test() {
    __log_info_native('[test:376] warship ram with no target')
    test_reload_city_session('data/default.map')
    city.figures.remove_figures(FIGURE_WARSHIP)

    var fid = __test_spawn_warship_on_water()
    if (!fid) {
        return test376_fail('warship not created')
    }
    var before = __test_figure_get_damage(0)
    for (var i = 0; i < 200; ++i) {
        __test_warship_ram(fid)
    }
    var after = __test_figure_get_damage(0)
    __log_info_native('[test:376] slot 0 damage ' + before + ' -> ' + after + ' after 200 rams with no target')
    if (after != before) {
        return test376_fail('the ram hit the empty figure slot 0 (damage ' + before + ' -> ' + after + ')')
    }
    if (!__test_figure_is_alive(fid)) {
        return test376_fail('the warship died')
    }
    __test376_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test376_ok
}
