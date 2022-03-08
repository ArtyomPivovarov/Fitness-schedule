<template>
    <div class="app" :class="{'app--dark': isDark }">
        <div class="app__filter">
            <Multiselect v-if="isSm"
                         v-model="filters.day"
                         :options="Object.values(days)"
                         label="name"
                         :show-labels="false"
                         placeholder=""
                         class="app__filter-item">
                <template #noResult>
                    Ничего не найдено
                </template>
            </Multiselect>

            <Multiselect v-model="filters.clubid"
                         :options="clubs"
                         label="name"
                         :show-labels="false"
                         placeholder=""
                         class="app__filter-item">
                <template #noResult>
                    Ничего не найдено
                </template>
            </Multiselect>

            <Multiselect v-model="filters.classid"
                         :options="classes"
                         label="name"
                         :show-labels="false"
                         placeholder=""
                         class="app__filter-item">
                <template #noResult>
                    Ничего не найдено
                </template>
            </Multiselect>

            <Multiselect v-model="filters.areaid"
                         :options="areas"
                         label="name"
                         :show-labels="false"
                         placeholder=""
                         class="app__filter-item">
                <template #noResult>
                    Ничего не найдено
                </template>
            </Multiselect>

            <Multiselect v-model="filters.teamid"
                         :options="teams"
                         label="name"
                         :show-labels="false"
                         placeholder=""
                         class="app__filter-item">
                <template #noResult>
                    Ничего не найдено
                </template>
            </Multiselect>
        </div>

        <table v-if="!isSm" class="app__schedule">
            <thead>
                <tr>
                    <th>
                        <img class="app__clock-icon" src="@/assets/icons/clock.svg" alt="">
                    </th>
                    <th v-for="i in 7" :key="'day' + i">{{ days[i].name }}</th>
                </tr>
            </thead>

            <tbody v-if="filteredItems.length">
                <tr v-for="(timeItems, time) in formattedItems" :key="time">
                    <td class="app__time">{{ time }}</td>
                    <td v-for="day in 7" :key="`${time}-${day}`">
                        <div class="app__item"
                             :class="{'app__item--paid': JSON.parse(item.paid)}"
                             v-for="item in timeItems[day]"
                             :key="item.id"
                             @click="openModal(item)">
                            <div v-if="JSON.parse(item.paid)" class="app__item-paid">₽</div>
                            <div class="app__item-date">
                                {{ `${days[parseInt(item.day)].name} ${item.time}` }}
                            </div>
                            <h3 class="app__item-title">{{ item.class }}</h3>
                            <div class="app__item-subtitle">{{ item.team }}</div>
                            <div class="app__item-text">{{ item.area }}</div>
                            <div class="app__item-text">{{ item.club }}</div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-else class="app__items">
            <div class="app__item"
                 :class="{'app__item--paid': JSON.parse(item.paid)}"
                 v-for="item in filteredItems"
                 :key="item.id"
                 @click="openModal(item)">
                <div v-if="JSON.parse(item.paid)" class="app__item-paid">₽</div>
                <div class="app__item-date">
                    {{ `${days[parseInt(item.day)].name} ${item.time}` }}
                </div>
                <h3 class="app__item-title">{{ item.class }}</h3>
                <div class="app__item-subtitle">{{ item.team }}</div>
                <div class="app__item-text">{{ item.area }}</div>
                <div class="app__item-text">{{ item.club }}</div>
            </div>
        </div>

        <Loader v-if="loading" />

        <div v-else-if="!filteredItems.length" class="app__empty">
            Нет результатов
        </div>

        <transition name="fade">
            <Modal v-show="modalIsOpen"
                   :title="modalItem.class"
                   :text="modalItem.description"
                   :day="days[modalItem.day]?.name"
                   :time="modalItem.time"
                   :club="modalItem.club"
                   :area="modalItem.area"
                   @close="closeModal"/>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'App'
};
</script>

<script setup>
import { onMounted, ref, reactive, computed, onBeforeUnmount, watch } from 'vue';
import Multiselect from 'vue-multiselect';
import Loader from '@/components/Loader';
import Modal from '@/components/Modal';
import bridge from '@vkontakte/vk-bridge';

const GET_ITEMS_URL = 'https://fitnes-ptz.ru/mobile/widget2.php';
const BREAKPOINT_SM = 768;

const days = {
    0: { id: 0, name: 'Все дни' },
    1: { id: '1', name: 'Пн' },
    2: { id: '2', name: 'Вт' },
    3: { id: '3', name: 'Ср' },
    4: { id: '4', name: 'Чт' },
    5: { id: '5', name: 'Пт' },
    6: { id: '6', name: 'Сб' },
    7: { id: '7', name: 'Вс' },
};

const windowWidth = ref(window.innerWidth);
const loading = ref(false);
const items = ref([]);
const modalIsOpen = ref(false);
const modalItem = ref({});
const isDark = ref(false);

const isSm = computed(() => windowWidth.value < BREAKPOINT_SM);

const clubs = reactive([
    { id: 0, name: 'Все клубы' }
]);
const teams = reactive([
    { id: 0, name: 'Все инструкторы' }
]);
const classes = reactive([
    { id: 0, name: 'Все направления' }
]);

const areas = reactive([
    { id: 0, name: 'Все залы' },
]);

const filters = reactive({
    clubid: clubs[0],
    classid: classes[0],
    areaid: areas[0],
    teamid: teams[0],
    day: days[(new Date()).getDay() || 7],
});

const filteredItems = computed(() => items.value.filter(el => {
    let passed = true;

    for (const [key, item] of Object.entries(filters)) {
        if (!item.id || (key === 'day' && !isSm.value)) continue;

        if (item.id !== el[key]) {
            passed = false;
            break;
        }
    }

    return passed;
}));

const formattedItems = computed(() => {
    const items = {};

    filteredItems.value.forEach(el => {
        if (items[el.time]?.[parseInt(el.day)]) {
            items[el.time][parseInt(el.day)].push(el);
        } else if (items[el.time]) {
            items[el.time][parseInt(el.day)] = [el];
        } else {
            items[el.time] = { [parseInt(el.day)]: [el] };
        }
    });

    return items;
});

const windowWidthUpdate = () => {
    windowWidth.value = window.innerWidth;
};

const setOptions = () => {
    items.value.forEach(item => {
        if (!clubs.find(el => el.id === item.clubid)) {
            clubs.push({ id: item.clubid, name: item.club });
        }

        if (!teams.find(el => el.id === item.teamid)) {
            teams.push({ id: item.teamid, name: item.team });
        }

        if (!classes.find(el => el.id === item.classid)) {
            classes.push({ id: item.classid, name: item.class });
        }

        if (!areas.find(el => el.id === item.areaid)) {
            areas.push({ id: item.areaid, name: `${item.area} (${item.club})` });
        }
    });
};

const sortItemsByTime = () => {
    items.value.sort((a, b) => a.time > b.time ? 1 : (a.time < b.time ? -1 : 0));
};

const sortItemsByDay = () => {
    items.value.sort((a, b) => {
        return parseInt(a.day) > parseInt(b.day)
            ? 1
            : parseInt(a.day) < parseInt(b.day) ? -1 : (a.time > b.time ? 1 : (a.time < b.time ? -1 : 0));
    });
};

const sortItems = () => {
    if (isSm.value) {
        sortItemsByDay();
    } else {
        sortItemsByTime();
    }
};

const fetchItems = async () => {
    loading.value = true;

    try {
        const response = await fetch(GET_ITEMS_URL);

        if (!response.ok) {
            loading.value = false;
            return;
        }

        ({ schedule: items.value } = await response.json());
    } catch (e) {
        console.error(e);
    }

    sortItems();
    setOptions();

    loading.value = false;
};

const closeModal = () => {
    modalIsOpen.value = false;
};

const openModal = (item) => {
    modalItem.value = item;
    modalIsOpen.value = true;
};

watch(isSm, () => {
    sortItems();
});

onMounted(() => {
    fetchItems();
    window.addEventListener('resize', windowWidthUpdate);
    bridge.subscribe(({ detail: { type, data } }) => {
        if (type === 'VKWebAppUpdateConfig') {
            isDark.value = data.appearance === 'dark' || data.scheme.includes('dark') || data.scheme.includes('gray');
        }
    });
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', windowWidthUpdate);
});
</script>

<style lang="scss" src="./style.scss"/>
