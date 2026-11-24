// To-do 2e: running Selima VI forward tripped the [stub-record] guard, figure 0's direction changing every tick. The
// missile line-of-sight check (figure_movement_can_launch_cross_country_missile) traces the path in figure 0 as the
// original does; set_cross_country_direction also sets that figure's direction, which the guard did not mask. The
// runner fails any test that logs [stub-record], so this test fails on the old code without a marker of its own.
// Markers:
//   [test-marker] t921_missile_check_ran

function run_test() {
    test_reload_city_session('data/default.map')
    var cx = (__scenario_map.width / 2) | 0
    var cy = (__scenario_map.height / 2) | 0
    __test_run_ticks(2)
    var soldier = test_figure_create(FIGURE_INFANTRY, cx + 3, cy + 1)
    var spear = test_figure_create(FIGURE_ENEMY_EGYPTIAN_SPEAR, cx, cy)
    var fired = soldier && spear && __test_spearman_fire_initial_missile(spear)
    __test_run_ticks(2)
    __log_info_native('[test:921] fired ' + fired)
    if (fired) {
        __log_marker('t921_missile_check_ran')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t921_missile_check_ran')
}
