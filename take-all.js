/** @param {NS} ns **/
export async function main(ns) {
    const origin_unfiltered = ns.scan(ns.getHostname())
	const purchased = ns.getPurchasedServers()
	const origin = []
	const all_servers = []

	for (let i = 0; i < origin_unfiltered.length; i++) {
		if (purchased.includes(origin_unfiltered[i])) {
			 continue
		}
		origin.push(origin_unfiltered[i])
	}

	for (let i = 0; i < origin.length; i++) {
		check(ns, origin[i], all_servers)
	}

	const server_and_hack_lvl = [];
	for (let i = 0; i < all_servers.length; i++) {
		server_and_hack_lvl.push({
			'name': all_servers[i],
			'level': ns.getServerRequiredHackingLevel(all_servers[i])
		})
	}

	const sorted = server_and_hack_lvl.sort(
		(s1, s2) => s1.level - s2.level,
	)

	for (let i = 0; i < sorted.length; i++) {
		const name = sorted[i].name
		const level = sorted[i].level
		const has_root = await ns.hasRootAccess(name)

		// ns.hasRootAccess(s) &&
		if (!has_root && name !== 'home' && level <= ns.getHackingLevel()) {
			await take(ns, name)
		}
	}
}

export function check(ns, s, all_servers) {
	const new_servers = ns.scan(s)

	for (let i = 0; i < new_servers.length; i++) {
		if (all_servers.includes(new_servers[i])) {
			continue
		}

		all_servers.push(new_servers[i])
		check(ns, new_servers[i], all_servers)
	}
}

export async function take(ns, s) {
	if (ns.fileExists('BruteSSH.exe', 'home')) {
		ns.brutessh(s)
	}
	if (ns.fileExists('relaySMTP.exe', 'home')) {
		ns.relaysmtp(s)
	}
	if (ns.fileExists('FTPCrack.exe', 'home')) {
		ns.ftpcrack(s)
	}
	if (ns.fileExists('HTTPWorm.exe', 'home')) {
		ns.httpworm(s)
	}
	if (ns.fileExists('SQLInject.exe', 'home')) {
		ns.sqlinject(s)
	}

	try {
		ns.nuke(s)
	}
	catch (e) {
		return
	}

	await ns.scp('weaken-grow.js', 'home', s)

	const need = ns.getScriptRam('weaken-grow.js')
	const ram = ns.getServerMaxRam(s) - ns.getServerUsedRam(s)
	ns.tprint(`server has ${ram} ram usable`)

	if (ram > need) {
		if (ns.getServerMaxMoney(s) > 0) {
			ns.tprint(`running hack on ${s}`)
			ns.exec('weaken-grow.js', s, Math.floor(ram / need), s)
		}
		else {
			ns.tprint(`running hack on foodnstuff`)
			ns.exec('weaken-grow.js', s, Math.floor(ram / need), 'foodnstuff')
		}
	}
	else {
		ns.tprint(`no ram on ${s}, not hacking`)
	}
}