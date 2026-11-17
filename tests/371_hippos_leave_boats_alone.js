// Hippos and boats (Brendan, 2026-11-16: hippos sank fishing boats and a transport; a sinking fishing boat
// cried out like a citizen).
// - OG Figure_model gives the fishing boat, ferry and trade ship category 0: nobody fights them, and a hippo
//   does not hunt them.
// - A hippo's forbidden_prey (transports, warships...) only kept it from hunting them; on a shared tile it
//   still opened a fight. Soldiers riding a transport (invisible on its tile) are left alone too.
// - A sinking boat plays the ship's death sound (OG figure sound 17), not a citizen's.

var __test371_ok = false

function test371_fail(msg) {
    __log_info_native('[test:371] ' + msg)
    __test371_ok = false
    __test_signal_ready()
}

function test371_fight(hippo, x, y) {
    __test_figure_combat_attack_at(hippo, x, y)
    return __test_figure_in_attack(hippo) ? __test_figure_get_opponent_id(hippo) : 0
}

function run_test() {
    __log_info_native('[test:371] hippos leave boats alone')
    test_reload_city_session('data/default.map')
    city.figures.remove_figures(FIGURE_HIPPO)
    for (var x = 28; x <= 36; ++x) {
        for (var y = 28; y <= 36; ++y) {
            __test_make_deep_water(x, y)
        }
    }

    var kinds = [
        ['fishing boat', FIGURE_FISHING_BOAT],
        ['ferry', FIGURE_FERRY_BOAT],
        ['trade ship', FIGURE_TRADE_SHIP],
        ['transport', FIGURE_TRANSPORT_SHIP]
    ]
    for (var i = 0; i < kinds.length; ++i) {
        var hippo = test_figure_create(FIGURE_HIPPO, 32, 32)
        var boat = test_figure_create(kinds[i][1], 32, 32)
        if (!hippo || !boat) {
            return test371_fail(kinds[i][0] + ': figures not created')
        }
        var opp = test371_fight(hippo, 32, 32)
        __log_info_native('[test:371] hippo meets ' + kinds[i][0] + ': opponent ' + opp)
        if (opp) {
            return test371_fail('hippo opened a fight with a ' + kinds[i][0])
        }

        // Resting next to it for longer than the hunt delay: no chase either.
        __test_figure_set_action(hippo, 18)
        __test_figure_set_wait_ticks(hippo, 400)
        for (var t = 0; t < 200; ++t) {
            __test_figure_action_perform(hippo)
            var act = __figure_get_action_state(hippo)
            if (act == 21 || __test_figure_in_attack(hippo)) {
                return test371_fail('hippo went for a ' + kinds[i][0] + ' (action ' + act + ') at tick ' + t)
            }
        }

        // The boat sinks with the ship's sound. A trade ship takes to the water on its first tick (the others
        // on creation, and a homeless fishing boat or ferry would vanish on a tick).
        if (kinds[i][1] == FIGURE_TRADE_SHIP) {
            __test_figure_action_perform(boat)
        }
        __test_sound_effects_requested()
        __test_figure_play_die_sound(boat)
        var played = __test_sound_effects_requested()
        if (played != '' + SOUND_EFFECT_SHIP_DIE) {
            return test371_fail(kinds[i][0] + ' sank with effects [' + played + '], want ' + SOUND_EFFECT_SHIP_DIE)
        }
        city.figures.remove_figures(FIGURE_HIPPO)
        city.figures.remove_figures(kinds[i][1])
    }

    // A soldier riding a transport is hidden on its tile: no fight. The same soldier in the open: a fight.
    var hippo2 = test_figure_create(FIGURE_HIPPO, 32, 32)
    var soldier = test_figure_create(FIGURE_INFANTRY, 32, 32)
    __test_figure_set_visible(soldier, 0)
    var hidden = test371_fight(hippo2, 32, 32)
    __test_figure_set_visible(soldier, 1)
    var seen = test371_fight(hippo2, 32, 32)
    __log_info_native('[test:371] soldier hidden: opponent ' + hidden + ', in the open: ' + seen + ' (soldier ' + soldier + ')')
    if (hidden || seen != soldier) {
        return test371_fail('hidden soldier fought ' + hidden + ', visible soldier fought ' + seen)
    }

    if (__sound_effect_file(SOUND_EFFECT_SHIP_DIE) != 'Wavs/ship_die.wav') {
        return test371_fail('ship death effect plays "' + __sound_effect_file(SOUND_EFFECT_SHIP_DIE) + '"')
    }

    __test371_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test371_ok
}
