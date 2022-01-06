/** @param {NS} ns **/
export async function main(ns) {
	const mem_req = ns.getScriptRam('weaken-grow.js')
	const purchased = ns.getPurchasedServers()
	const unused = find_unused(ns, purchased)

	const unused_purchased = []

	for (let i = 0; i < purchased.length; i++) {
		const mem_used = ns.getServerUsedRam(purchased[i])
		const mem_max = ns.getServerMaxRam(purchased[i])

		if (mem_max - mem_used >= mem_req) {
			unused_purchased.push(purchased[i])
		}
	}

	for (let i = 0; i < unused_purchased.length; i++) {
		const target = unused[i].name
		const mem_used = ns.getServerUsedRam(unused_purchased[i])
		const mem_max = ns.getServerMaxRam(unused_purchased[i])
		const threads = Math.floor((mem_max - mem_used) / mem_req)

		ns.tprint(`weaken-grow.js ${unused_purchased[i]}, ${threads}, ${target}`)
		ns.exec('weaken-grow.js', unused_purchased[i], threads, target)
		ns.tprint(`${unused_purchased[i]}: run weaken-grow.js -t ${threads} ${target}`)
	}
}

function find_unused(ns, purchased) {
    const origin_unfiltered = ns.scan(ns.getHostname())
	const origin = []
	const all_servers = []
	const old_remaining = []

	for (let i = 0; i < origin_unfiltered.length; i++) {
		if (purchased.includes(origin_unfiltered[i])) {
			 continue
		}
		origin.push(origin_unfiltered[i])
	}

	for (let i = 0; i < origin.length; i++) {
		check(ns, origin[i], all_servers)
	}

	const r_procs = frunning_number_of_procs(ns, all_servers)

	for (let i = 0; i < all_servers.length; i++) {
		old_remaining.push(all_servers[i])
	}

	const to_remove = []
	const remaining = []

	for (let i = 0; i < r_procs.length; i++) {
		for (let j = 0; j < r_procs[i].length; j++) {
			if (r_procs[i][j].filename !== "weaken-grow.js") {
				continue
			}

			if (parseInt(r_procs[i][j].threads) > 512) {
				to_remove.push(r_procs[i][j]['args'][0])
				continue
			}
		}
	}

	for (let i = 0; i < old_remaining.length; i++) {
		if (to_remove.indexOf(old_remaining[i]) > -1) {
			continue
		}
		remaining.push(old_remaining[i])
	}

	const remaining_with_money = []

	for (let i = 0; i < remaining.length; i++) {
		const s = remaining[i]
		const max_money = ns.getServerMaxMoney(s)
		if (max_money > 0 && s !== 'home' && ns.getServerRequiredHackingLevel(s) <= ns.getHackingLevel()) {
			remaining_with_money.push({'name': remaining[i], 'money': max_money})
		}
	}

	return remaining_with_money.sort(
		(s1, s2) => s2.money - s1.money,
	)
}

export function frunning_number_of_procs(ns, all_servers) {
	const procs = []

	for (let i = 0; i < all_servers.length; i++) {
        const processes = ns.ps(all_servers[i])
		const p_for_server = []

		for (let j = 0; j < processes.length; j++) {
			p_for_server.push(processes[j])
		}

		procs.push(p_for_server)
	}

	return procs
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