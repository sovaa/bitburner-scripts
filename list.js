/** @param {NS} ns **/
export async function main(ns) {
    const origin_unfiltered = ns.scan(ns.getHostname())
	const purchased = ns.getPurchasedServers()
	const origin = []
	const all_servers = []

	// remove all bought servers that are scanable from home, they have no
	// money anyway
	for (let i = 0; i < origin_unfiltered.length; i++) {
		if (purchased.includes(origin_unfiltered[i])) {
			 continue
		}
		origin.push(origin_unfiltered[i])
	}

	// recursively scan every server that is scanable from the 'home' server;
	// all servers in the game will be listed in 'all_servers'
	for (let i = 0; i < origin.length; i++) {
		recursively_scan_these_servers(ns, origin[i], all_servers)
	}

	ns.tprint(
		'SERVER'.padEnd(20),
		'HACK LVL'.padEnd(12),
		'MAX MONEY'
	)
	ns.tprint('----------------------------------------------')

	// check the necessary hack level for each server in the game
	const server_and_hack_lvl = [];
	for (let i = 0; i < all_servers.length; i++) {
		server_and_hack_lvl.push({
			'name': all_servers[i],
			'level': ns.getServerRequiredHackingLevel(all_servers[i])
		})
	}

	// sort each server in the game not by their distance, but by their hack
	// level, so we can print what next to hack
	const sorted = server_and_hack_lvl.sort(
		(s1, s2) => s1.level - s2.level,
	)

	// now print each server that we have NOT yet root access to, but we DO
	// HAVE a hack level high enough for to nuke
	for (let i = 0; i < sorted.length; i++) {
		const name = sorted[i].name
		const level = sorted[i].level

		if (!ns.hasRootAccess(name)) {
			const server_max_money = ns.getServerMaxMoney(name)

			ns.tprint(
				name.padEnd(20),
				level.toFixed(0).toString().padEnd(12),
				server_max_money.toFixed(0).toString().padEnd(15)
			)
		}
	}
}

export function recursively_scan_these_servers(ns, s, all_servers) {
    // run scan() on 'this' arbitrary server (since this method is recursive)
	const new_servers = ns.scan(s)

	for (let i = 0; i < new_servers.length; i++) {
		// avoid an infinite loop, only add servers to scan that we haven't
		// scanned before
		if (all_servers.includes(new_servers[i])) {
			continue
		}

		// add the unique servers to the 'all_servers' list, which we will be
		// accessing in the main() function afterwards
		all_servers.push(new_servers[i])

		// now scan every server that is scannable from this server,
		// recursively....
		recursively_scan_these_servers(ns, new_servers[i], all_servers)
	}
}