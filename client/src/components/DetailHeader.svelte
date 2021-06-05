<div>
	<span><slot name="left" /></span>
	<span><slot name="middle" /></span>
	<span><slot name="right" /></span>
</div>

<style>
	div {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #efefef;
		margin: 0 0 1rem 0;
	}

	span {
		text-align: center;
	}
</style>
