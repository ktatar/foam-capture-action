import * as process from 'process'
import * as core from '@actions/core'
import {opinionatedBootstrap, cleanupReferences} from 'foam-capture'
import {captureToTaggedInbox} from './inbox'

async function run(): Promise<void> {
  try {
    const capture: string = core.getInput('capture')
    core.debug(`Got value to capture: ${capture}`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    let workspace: string = core.getInput('workspace')
    if (workspace == '' && process.env['GITHUB_WORKSPACE'] !== undefined) {
      workspace = process.env['GITHUB_WORKSPACE']
    }
    if (workspace === undefined) {
      core.setFailed(
        'Unable to resolve workspace from input or GITHUB_WORKSPACE'
      )
      return
    }
    // File the capture into inbox.md before foam scans the workspace, so cleanup sees the update
    captureToTaggedInbox(workspace, capture)
    const foam = await opinionatedBootstrap(workspace)
    await cleanupReferences(foam, {'without-extensions': undefined})

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
