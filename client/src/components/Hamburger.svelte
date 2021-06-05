<script lang="ts">
	export let isActive: boolean;
	function handleClick(): void {
		isActive = !isActive;
	}
</script>

<button on:click|preventDefault={handleClick}>
	<span class="first {isActive ? 'first-active' : ''}" />
	<span class="second {isActive ? 'second-active' : ''}" />
	<span class="third {isActive ? 'third-active' : ''}" />
</button>

<style>
	button {
		position: fixed;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		outline: none;
		padding: 0;
		z-index: 1000;
		right: 1.5rem;
		bottom: 1rem;
		background-color: #005396;
		border-color: transparent;
	}
	button:focus {
		outline: none;
	}
	span {
		position: absolute;
		width: 40px;
		height: 4px;
		left: 10px;
		border-radius: 2px;
		background-color: white;
		opacity: 1;
		transition: 0.2s;
	}
	.first {
		top: 18px;
	}
	.first-active {
		top: 28px;
		transform: rotate(45deg);
	}
	.second {
		top: 28px;
	}
	.second-active {
		opacity: 0;
	}
	.third {
		top: 38px;
	}
	.third-active {
		top: 29px;
		transform: rotate(-45deg);
	}
</style>
