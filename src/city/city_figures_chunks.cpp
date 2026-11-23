#include "city/city_figures_chunks.h"

#include "city/city.h"
#include "city/city_buildings.h"
#include "city/city_figures.h"
#include "io/io_buffer.h"

void figures_chunk::bind_data(io_buffer* iob, size_t version) {
    if (iob->is_read_access()) {
        stub_records_guard_reset();
    }
    g_city.figures.init_figures();
    figure_original_fields* original = iob->is_read_access() ? city_figures_begin_read(version) : nullptr;
    for (int i = 0; i < MAX_FIGURES; i++) {
        figure_get(i)->bind(iob, original ? &original[i] : nullptr); // doing this because some members are
                                                                     // PRIVATE.
        figure_get(i)->id = i;
    }
}

void figures_chunk::reset() {
    g_city.figures.init_figures();
}

void figure_sequence_chunk::bind_data(io_buffer* iob, size_t version) {
    iob->bind____skip(4);
    // iob->bind(BIND_SIGNATURE_INT32, &g_figure_data.created_sequence);
}
