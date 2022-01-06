/** @param {NS} ns **/
export async function main(ns) {
	const server = ns.args[0]
	const min_sec_lvl = ns.getServerMinSecurityLevel(server) + 5
	const max_money = ns.getServerMaxMoney(server) * 0.75

	while (true) {
		if (ns.getServerSecurityLevel(server) > min_sec_lvl) {
			await ns.weaken(server)
		}
		else if (ns.getServerMoneyAvailable(server) < max_money) {
			await ns.grow(server)
		}
		else {
			await ns.hack(server)
		}
	}
}