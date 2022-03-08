<template>
    <div class="modal-wrap" @click="emit('close')">
        <div class="modal" @click.stop>
            <div class="modal__header">
                {{ props.title }}

                <button class="modal__close-btn"
                        title="close"
                        @click="emit('close')"/>
            </div>
            <div class="modal__content">
                <b>{{ `${props.day} ${props.time}`}}</b><br><br>
                {{ props.text }}<br><br>
                <b>{{ props.club }} / {{ props.area }}</b>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Modal',
};
</script>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    title: {
        type: String
    },
    text: {
        type: String
    },
    day: {
        type: String
    },
    time: {
        type: String
    },
    club: {
        type: String
    },
    area: {
        type: String
    },
});

const emit = defineEmits(['close']);
</script>

<style src="./style.scss" lang="scss" scoped/>
